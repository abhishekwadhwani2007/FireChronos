"""
FIRECHRONOS - Pan-Asian Multi-Sensor ETL & Harmonization Engine
Processes authentic NASA FIRMS observations across Asia:
  - MODIS C6.1 (Terra/Aqua, 1 km)
  - VIIRS NOAA-20 / JPSS-1 (375 m)
  - VIIRS NOAA-21 / JPSS-2 (375 m)
Domain: 52.1°E to 109.9°E, 4.7°N to 40.9°N (India, Pakistan, Afghan, E. Iran, China, Malaysia, etc.)
Total Observations: ~20.9 Million authentic NASA detections (2020-2026)
"""

import os, json, sqlite3, time
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).resolve().parent.parent
DATA_RAW = BASE / "data" / "raw"
DATA_PROCESSED = BASE / "data" / "processed"
DATA_PROCESSED.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("FIRECHRONOS: Pan-Asian Multi-Sensor Harmonization Pipeline")
print("=" * 70)

# Define dataset manifests
DATASETS = [
    {
        "sensor": "MODIS_C61",
        "archive": DATA_RAW / "fire_archive_M-C61_847193.csv",
        "nrt":     DATA_RAW / "fire_nrt_M-C61_847193.csv",
        "resolution": "1000m",
        "satellite": "Terra / Aqua",
    },
    {
        "sensor": "VIIRS_N20",
        "archive": DATA_RAW / "fire_archive_J1V-C2_847194.csv",
        "nrt":     DATA_RAW / "fire_nrt_J1V-C2_847194.csv",
        "resolution": "375m",
        "satellite": "NOAA-20 (JPSS-1)",
    },
    {
        "sensor": "VIIRS_N21",
        "archive": DATA_RAW / "fire_archive_J2V-C2_847195.csv",
        "nrt":     DATA_RAW / "fire_nrt_J2V-C2_847195.csv",
        "resolution": "375m",
        "satellite": "NOAA-21 (JPSS-2)",
    },
]

# Initialize SQLite database for interactive hotspot drilldown
db_path = DATA_PROCESSED / "fire_events.db"
if db_path.exists():
    try:
        os.remove(db_path)
    except Exception:
        pass

conn = sqlite3.connect(str(db_path))
cur = conn.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS daily_hotspots (
        acq_date TEXT,
        latitude REAL,
        longitude REAL,
        acq_time TEXT,
        satellite TEXT,
        instrument TEXT,
        confidence TEXT,
        frp REAL,
        brightness REAL,
        daynight TEXT
    )
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_date ON daily_hotspots(acq_date)")
conn.commit()

# Daily master aggregation map
# Key: 'YYYY-MM-DD'
daily_map = {}
grid_map  = {} # (round_lat, round_lon) -> [count, frp_sum]

total_rows_processed = 0
sensor_counts = {"MODIS_C61": 0, "VIIRS_N20": 0, "VIIRS_N21": 0}
t_start = time.time()

# Chunked Ingestion Loop
CHUNK_SIZE = 400000

for ds in DATASETS:
    sensor_key = ds["sensor"]
    files = [ds["archive"], ds["nrt"]]

    for fpath in files:
        if not fpath.exists():
            print(f"Skipping missing file: {fpath.name}")
            continue

        print(f"\n--> Ingesting {sensor_key} ({ds['satellite']}): {fpath.name}...")
        file_rows = 0

        usecols = [
            "latitude", "longitude", "brightness", "acq_date", "acq_time",
            "satellite", "confidence", "frp", "daynight"
        ]

        for chunk in pd.read_csv(fpath, usecols=usecols, chunksize=CHUNK_SIZE, low_memory=False):
            chunk = chunk.dropna(subset=["latitude", "longitude", "acq_date"])
            chunk["frp"] = pd.to_numeric(chunk["frp"], errors="coerce").fillna(0.0)
            chunk["brightness"] = pd.to_numeric(chunk["brightness"], errors="coerce").fillna(0.0)

            n_chunk = len(chunk)
            file_rows += n_chunk
            total_rows_processed += n_chunk
            sensor_counts[sensor_key] += n_chunk

            # Categorize confidence
            if sensor_key == "MODIS_C61":
                c_num = pd.to_numeric(chunk["confidence"], errors="coerce").fillna(0)
                is_h = c_num >= 80
                is_n = (c_num >= 30) & (c_num < 80)
                is_l = c_num < 30
            else:
                c_str = chunk["confidence"].astype(str).str.lower()
                is_h = c_str.str.startswith("h")
                is_n = c_str.str.startswith("n")
                is_l = c_str.str.startswith("l")

            chunk["conf_cat"] = "nominal"
            chunk.loc[is_h, "conf_cat"] = "high"
            chunk.loc[is_l, "conf_cat"] = "low"

            chunk["is_day"] = chunk["daynight"].astype(str).str.upper() == "D"

            # Aggregate per date
            for date_str, grp in chunk.groupby("acq_date"):
                if date_str not in daily_map:
                    daily_map[date_str] = {
                        "date": date_str,
                        "modis_count": 0, "modis_frp_sum": 0.0, "modis_frp_max": 0.0,
                        "n20_count": 0, "n20_frp_sum": 0.0, "n20_frp_max": 0.0,
                        "n21_count": 0, "n21_frp_sum": 0.0, "n21_frp_max": 0.0,
                        "conf_high": 0, "conf_nom": 0, "conf_low": 0,
                        "day_count": 0, "night_count": 0,
                        "top_hotspots": []
                    }

                d_entry = daily_map[date_str]
                g_len = len(grp)
                g_frp_sum = float(grp["frp"].sum())
                g_frp_max = float(grp["frp"].max()) if g_len > 0 else 0.0

                if sensor_key == "MODIS_C61":
                    d_entry["modis_count"] += g_len
                    d_entry["modis_frp_sum"] += g_frp_sum
                    d_entry["modis_frp_max"] = max(d_entry["modis_frp_max"], g_frp_max)
                elif sensor_key == "VIIRS_N20":
                    d_entry["n20_count"] += g_len
                    d_entry["n20_frp_sum"] += g_frp_sum
                    d_entry["n20_frp_max"] = max(d_entry["n20_frp_max"], g_frp_max)
                elif sensor_key == "VIIRS_N21":
                    d_entry["n21_count"] += g_len
                    d_entry["n21_frp_sum"] += g_frp_sum
                    d_entry["n21_frp_max"] = max(d_entry["n21_frp_max"], g_frp_max)

                d_entry["conf_high"] += int((grp["conf_cat"] == "high").sum())
                d_entry["conf_nom"]  += int((grp["conf_cat"] == "nominal").sum())
                d_entry["conf_low"]  += int((grp["conf_cat"] == "low").sum())

                d_day = int(grp["is_day"].sum())
                d_entry["day_count"]   += d_day
                d_entry["night_count"] += (g_len - d_day)

            # Spatial 0.1° grid cell accumulation
            # Sample 1-in-5 rows for grid to optimize memory and throughput
            sample_grid = chunk.iloc[::4]
            r_lats = np.round(sample_grid["latitude"].values, 1)
            r_lons = np.round(sample_grid["longitude"].values, 1)
            frps   = sample_grid["frp"].values

            for la, lo, fr in zip(r_lats, r_lons, frps):
                k = (la, lo)
                if k not in grid_map:
                    grid_map[k] = [0, 0.0]
                grid_map[k][0] += 4
                grid_map[k][1] += float(fr) * 4

            # High-intensity fire drilldown insertion into SQLite (FRP >= 150 MW)
            high_int = chunk[chunk["frp"] >= 150.0]
            if len(high_int) > 0:
                rows_to_insert = [
                    (
                        r.acq_date, float(r.latitude), float(r.longitude),
                        str(r.acq_time), str(r.satellite), sensor_key,
                        str(r.conf_cat), float(r.frp), float(r.brightness),
                        str(r.daynight)
                    )
                    for r in high_int.itertuples(index=False)
                ]
                cur.executemany("INSERT INTO daily_hotspots VALUES (?,?,?,?,?,?,?,?,?,?)", rows_to_insert)

        print(f"   Done {fpath.name}: {file_rows:,} rows ingested.")

conn.commit()
conn.close()

elapsed_sec = time.time() - t_start
print(f"\nIngested {total_rows_processed:,} records in {elapsed_sec:.1f}s ({total_rows_processed/elapsed_sec:,.0f} rows/s)")
print(f"  - MODIS C6.1   : {sensor_counts['MODIS_C61']:,} detections")
print(f"  - VIIRS NOAA-20: {sensor_counts['VIIRS_N20']:,} detections")
print(f"  - VIIRS NOAA-21: {sensor_counts['VIIRS_N21']:,} detections")

# -------------------------------------------------------------------------
# Harmonization & Index Computation
# -------------------------------------------------------------------------
print("\nComputing Cross-Sensor Harmonization & Harmonized Activity Index (HAI)...")

# Sort dates chronologically
sorted_dates = sorted(daily_map.keys())
print(f"Date range: {sorted_dates[0]} to {sorted_dates[-1]} ({len(sorted_dates)} unique calendar days)")

# Calculate empirical resolution scaling factor (VIIRS vs MODIS ratio on co-observed days)
ratios = []
for d in sorted_dates:
    e = daily_map[d]
    if e["modis_count"] > 50 and e["n20_count"] > 100:
        ratios.append(e["n20_count"] / e["modis_count"])
mean_ratio = float(np.median(ratios)) if len(ratios) > 0 else 6.25
print(f"Empirical VIIRS 375m to MODIS 1km Resolution Factor: {mean_ratio:.2f}x")

# Calculate daily composite counts & FRP
raw_daily_records = []
for d in sorted_dates:
    e = daily_map[d]
    dt = pd.Timestamp(d)
    m_count = e["modis_count"]
    n20_cnt = e["n20_count"]
    n21_cnt = e["n21_count"]

    # Effective harmonized observation count
    # When both NOAA-20 and NOAA-21 are present, average their rates or calibrate
    if n20_cnt > 0 and n21_cnt > 0:
        eff_viirs = 0.52 * n20_cnt + 0.48 * n21_cnt
    elif n20_cnt > 0:
        eff_viirs = n20_cnt
    else:
        eff_viirs = m_count * mean_ratio

    total_frp = e["modis_frp_sum"] + e["n20_frp_sum"] + e["n21_frp_sum"]
    total_det = m_count + n20_cnt + n21_cnt

    raw_daily_records.append({
        "date": d,
        "year": dt.year,
        "month": dt.month,
        "day": dt.day,
        "eff_count": eff_viirs,
        "total_detections": total_det,
        "total_frp": total_frp,
        "entry": e
    })

# Compute 12-month climatological normals on baseline
month_counts = {m: [] for m in range(1, 13)}
month_frps   = {m: [] for m in range(1, 13)}

for r in raw_daily_records:
    month_counts[r["month"]].append(r["eff_count"])
    month_frps[r["month"]].append(r["total_frp"])

baseline = {}
for m in range(1, 13):
    c_arr = np.array(month_counts[m])
    f_arr = np.array(month_frps[m])
    baseline[str(m)] = {
        "month": m,
        "mean_count": round(float(np.mean(c_arr)), 1),
        "std_count":  round(float(np.std(c_arr)) + 1e-4, 1),
        "mean_frp":   round(float(np.mean(f_arr)), 1),
        "std_frp":    round(float(np.std(f_arr)) + 1e-4, 1),
    }

# Max baseline count for 0-100 scaling
all_eff = np.array([r["eff_count"] for r in raw_daily_records])
p99_eff = float(np.percentile(all_eff, 99.5))

final_calendar = []
for r in raw_daily_records:
    d = r["date"]
    m = r["month"]
    b = baseline[str(m)]

    # Normalized Harmonized Activity Index (0 to 100)
    # 60% frequency weight + 40% energy intensity weight
    count_score = min(100.0, (r["eff_count"] / p99_eff) * 100.0)
    frp_score   = min(100.0, (r["total_frp"] / (p99_eff * 35.0)) * 100.0)
    hai = round(0.65 * count_score + 0.35 * frp_score, 1)
    hai = max(1.0, min(100.0, hai))

    # Anomaly Z-Score
    z = (r["eff_count"] - b["mean_count"]) / b["std_count"]
    z = round(float(z), 2)

    if z >= 2.0:
        anom_code = "HIGH"
        anom_class = "Critical Anomaly"
    elif z >= 1.0:
        anom_code = "ELEVATED"
        anom_class = "Elevated Activity"
    elif z <= -1.0:
        anom_code = "LOW"
        anom_class = "Suppressed / Low"
    else:
        anom_code = "NORMAL"
        anom_class = "Climatological Normal"

    e = r["entry"]
    final_calendar.append({
        "date": d,
        "year": r["year"],
        "month": r["month"],
        "day": r["day"],
        "hai": hai,
        "anomaly_score": z,
        "anomaly_code": anom_code,
        "anomaly_class": anom_class,
        "total_detections": r["total_detections"],
        "total_frp_mw": round(r["total_frp"], 1),
        "modis": {
            "count": e["modis_count"],
            "frp_sum": round(e["modis_frp_sum"], 1),
            "frp_max": round(e["modis_frp_max"], 1),
        },
        "viirs_n20": {
            "count": e["n20_count"],
            "frp_sum": round(e["n20_frp_sum"], 1),
            "frp_max": round(e["n20_frp_max"], 1),
        },
        "viirs_n21": {
            "count": e["n21_count"],
            "frp_sum": round(e["n21_frp_sum"], 1),
            "frp_max": round(e["n21_frp_max"], 1),
        },
        "confidence": {
            "high": e["conf_high"],
            "nominal": e["conf_nom"],
            "low": e["conf_low"],
        },
        "daynight": {
            "day": e["day_count"],
            "night": e["night_count"],
        },
        # Compatibility aliases for existing backend/frontend code
        "viirs_count": r["total_detections"],
        "viirs_frp_sum": round(r["total_frp"], 1),
        "viirs_frp_mean": round(r["total_frp"] / (r["total_detections"] + 1), 1),
        "viirs_frp_max": max(e["modis_frp_max"], e["n20_frp_max"], e["n21_frp_max"]),
        "count": r["total_detections"],
        "frp_sum": round(r["total_frp"], 1),
    })

# Format Top Spatial Grid Hotspots
sorted_grid = sorted(grid_map.items(), key=lambda x: x[1][0], reverse=True)[:2500]
top_grid_cells = [
    {
        "lat": round(k[0], 1),
        "lon": round(k[1], 1),
        "count": int(v[0]),
        "frp_sum": round(v[1], 1)
    }
    for k, v in sorted_grid
]

# Save Core Processed JSON Artifacts
cal_out = DATA_PROCESSED / "india_daily_calendar.json"
with open(cal_out, "w", encoding="utf-8") as f:
    json.dump(final_calendar, f, indent=None) # compact for fast loading
print(f"\nSaved daily calendar ({len(final_calendar)} days): {cal_out}")

# Also save asia_daily_calendar.json as explicit asset
with open(DATA_PROCESSED / "asia_daily_calendar.json", "w", encoding="utf-8") as f:
    json.dump(final_calendar, f, indent=None)

base_out = DATA_PROCESSED / "india_monthly_baseline.json"
with open(base_out, "w", encoding="utf-8") as f:
    json.dump(baseline, f, indent=2)
print(f"Saved monthly baseline: {base_out}")

grid_out = DATA_PROCESSED / "india_grid_top_hotspots.json"
with open(grid_out, "w", encoding="utf-8") as f:
    json.dump(top_grid_cells, f, indent=None)
print(f"Saved top {len(top_grid_cells)} spatial grid cells: {grid_out}")

metadata = {
    "project": "FIRECHRONOS",
    "challenge": "NASA Space Apps 2026 - Harmonization of MODIS and VIIRS Hot Spots",
    "region_name": "Pan-Asian Transboundary Fire Belt (India, Pakistan, Afghan, E. Iran, China, Malaysia, etc.)",
    "bounding_box": [52.1, 4.7, 109.9, 40.9],
    "total_authentic_observations": total_rows_processed,
    "sensor_breakdown": {
        "MODIS_C61_Terra_Aqua": sensor_counts["MODIS_C61"],
        "VIIRS_NOAA20_JPSS1": sensor_counts["VIIRS_N20"],
        "VIIRS_NOAA21_JPSS2": sensor_counts["VIIRS_N21"]
    },
    "temporal_range": {
        "start_date": sorted_dates[0],
        "end_date": sorted_dates[-1],
        "calendar_days": len(sorted_dates)
    },
    "resolution_scaling_factor": round(mean_ratio, 2),
    "updated_at": pd.Timestamp.now().isoformat()
}
with open(DATA_PROCESSED / "metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print(f"Saved metadata: {DATA_PROCESSED / 'metadata.json'}")

print("\n" + "=" * 70)
print(f"ETL & HARMONIZATION COMPLETE [SUCCESS]")
print(f"Total Authentic NASA Observations Ingested: {total_rows_processed:,}")
print("=" * 70)
