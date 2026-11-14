"""
FIRECHRONOS - FastAPI Backend
NASA Space Apps Challenge 2026

Endpoints:
  GET /api/health
  GET /api/meta/sources
  GET /api/regions
  GET /api/regions/{region_id}/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&mode=harmonized|raw
  GET /api/regions/{region_id}/day/{date}
  GET /api/regions/{region_id}/sensor-comparison
  GET /api/regions/{region_id}/anomalies
  GET /api/regions/{region_id}/seasonal-profile
  GET /api/regions/{region_id}/grid
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import data_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_store.load_all()
    yield


app = FastAPI(
    title="FIRECHRONOS API",
    description="Harmonized MODIS & VIIRS active-fire data for India (NASA Space Apps 2026)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

REGIONS = {
    "asia": {
        "id": "asia",
        "name": "Pan-Asian Transboundary Fire Belt",
        "bbox": [52.1, 4.7, 109.9, 40.9],
        "demo": True,
        "description": "Pan-Asia (India, Pakistan, Afghan, E. Iran, China, Malaysia) - Multi-Sensor (MODIS + VIIRS N20/N21)",
    },
    "india": {
        "id": "india",
        "name": "India & South Asia",
        "bbox": [68.1, 6.7, 97.4, 35.5],
        "demo": True,
        "description": "India & South Asia - Multi-Sensor (MODIS + VIIRS N20/N21)",
    },
    "california": {
        "id": "california",
        "name": "California, USA",
        "bbox": [-124.5, 32.5, -114.1, 42.0],
        "demo": True,
        "description": "California - demonstration region (data pending)",
    },
    "amazon": {
        "id": "amazon",
        "name": "Amazon, South America",
        "bbox": [-73.0, -18.0, -44.0, 5.0],
        "demo": True,
        "description": "Amazon Basin - demonstration region (data pending)",
    },
}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["System"])
def health():
    days = len(data_store.get_all_days())
    meta = data_store.get_metadata()
    return {
        "status": "ok",
        "calendar_days": days,
        "total_detections": meta.get("total_detections", 0),
        "date_range": meta.get("date_range", {}),
    }


# ---------------------------------------------------------------------------
# Metadata / Data Center
# ---------------------------------------------------------------------------
@app.get("/api/meta/sources", tags=["Metadata"])
def meta_sources():
    meta = data_store.get_metadata()
    baseline = data_store.get_baseline()
    return {
        "project": meta.get("project"),
        "event": meta.get("event"),
        "total_detections": meta.get("total_detections"),
        "date_range": meta.get("date_range"),
        "sensors": meta.get("sensors", []),
        "spatial_framework": meta.get("spatial_framework"),
        "temporal_framework": meta.get("temporal_framework"),
        "harmonization_index": meta.get("harmonization_index"),
        "generated_at": meta.get("generated_at"),
        "methodology": {
            "spatial_harmonization": "All detections mapped to 0.1 degree x 0.1 degree (~11 km) WGS84 grid cells",
            "temporal_harmonization": "UTC calendar day aggregation - preserving original acquisition timestamps",
            "sensor_normalization": "MODIS calibrated equivalent = VIIRS count / 3.8 (Schroeder et al. 2014)",
            "anomaly_detection": "Z-score = (daily_count - monthly_mean) / monthly_std against 2020-2025 baseline",
            "hai_formula": "HAI = (0.6 * norm_log_frp + 0.4 * norm_z_score) * 100",
            "baseline_period": "2020-2025 multi-year monthly climatology",
            "confidence_mapping": "h=high, n=nominal, l=low (VIIRS product definitions)",
            "limitations": [
                "MODIS C6.1 not yet directly ingested - shown as calibrated equivalent",
                "VIIRS N21 not yet ingested",
                "Confidence n (nominal) includes ~79 percent of all detections",
                "Agricultural fire type included (type=0 vegetation fires)",
            ],
        },
        "references": [
            "Schroeder W. et al. (2014). The New VIIRS 375m active fire detection data product. RSE.",
            "Giglio L. et al. (2016). The Collection 6 MODIS active fire detection algorithm. RSE.",
            "NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/",
        ],
    }


# ---------------------------------------------------------------------------
# Regions
# ---------------------------------------------------------------------------
@app.get("/api/regions", tags=["Regions"])
def list_regions():
    return list(REGIONS.values())


@app.get("/api/regions/{region_id}", tags=["Regions"])
def get_region(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    return REGIONS[region_id]


# ---------------------------------------------------------------------------
# Calendar
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/calendar", tags=["Calendar"])
def get_calendar(
    region_id: str,
    start: str = Query(default="2020-01-01", alias="from"),
    end: str = Query(default="2026-11-13", alias="to"),
    mode: str = Query(default="harmonized", enum=["harmonized", "viirs", "modis"]),
):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"days": [], "meta": {"message": "Data pending for this region"}}

    days = data_store.get_calendar_range(start, end)

    # Build a minimal response optimised for calendar rendering
    calendar_days = []
    for d in days:
        entry: dict = {
            "date": d["date"],
            "year": d["year"],
            "month": d["month"],
            "day": d["day"],
            "hai": d["hai"],
            "anomaly_code": d["anomaly_code"],
            "anomaly_class": d["anomaly_class"],
            "anomaly_score": d["anomaly_score"],
        }
        modis_info = d.get("modis") if isinstance(d.get("modis"), dict) else {}
        modis_cal = d.get("modis_calibrated_count", round(modis_info.get("count", 0) * 3.8))
        modis_frp = d.get("modis_calibrated_frp", round(modis_info.get("frp_sum", 0.0) * 1.14, 1))

        if mode == "harmonized":
            entry["count"] = d.get("viirs_count", d.get("count", 0))
            entry["modis_count"] = modis_cal
            entry["frp_sum"] = d.get("viirs_frp_sum", d.get("frp_sum", 0))
        elif mode == "viirs":
            entry["count"] = d.get("viirs_count", d.get("count", 0))
            entry["frp_sum"] = d.get("viirs_frp_sum", d.get("frp_sum", 0))
        else:  # modis
            entry["count"] = modis_cal
            entry["frp_sum"] = modis_frp

        calendar_days.append(entry)

    total_count = sum(d.get("count", 0) for d in calendar_days)
    total_frp = sum(d.get("frp_sum", 0) for d in calendar_days)
    peak = max(calendar_days, key=lambda x: x.get("count", 0)) if calendar_days else {}
    high_days = sum(1 for d in calendar_days if d["anomaly_code"] == "HIGH")

    return {
        "region_id": region_id,
        "mode": mode,
        "date_range": {"start": start, "end": end},
        "days": calendar_days,
        "summary": {
            "total_days": len(calendar_days),
            "total_detections": total_count,
            "total_frp_mw": round(total_frp, 1),
            "peak_day": peak.get("date"),
            "peak_count": peak.get("count", 0),
            "unusually_high_days": high_days,
        },
    }


# ---------------------------------------------------------------------------
# Day Detail
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/day/{date}", tags=["Day Detail"])
def get_day_detail(region_id: str, date: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        raise HTTPException(status_code=404, detail="Data pending for this region")

    day = data_store.get_day(date)
    if day is None:
        raise HTTPException(status_code=404, detail=f"No data for date '{date}'")

    # Merge high-FRP hotspots from SQLite with daily record top_hotspots
    db_hotspots = data_store.get_hotspots_from_db(date)
    hotspots = db_hotspots if db_hotspots else day.get("top_hotspots", [])

    # Monthly baseline context
    baseline = data_store.get_baseline()
    month_key = str(day["month"])
    month_norm = baseline.get(month_key, {})

    modis_info = day.get("modis") if isinstance(day.get("modis"), dict) else {}
    modis_cal_count = day.get("modis_calibrated_count", round(modis_info.get("count", 0) * 3.8))
    modis_cal_frp = day.get("modis_calibrated_frp", round(modis_info.get("frp_sum", 0.0) * 1.14, 1))

    return {
        "date": day["date"],
        "year": day["year"],
        "month": day["month"],
        "day_of_month": day["day"],
        "sensors": {
            "viirs_n20": {
                "detection_count": day.get("viirs_count", day.get("count", 0)),
                "frp_sum_mw": day.get("viirs_frp_sum", day.get("frp_sum", 0)),
                "frp_mean_mw": day.get("viirs_frp_mean", 0),
                "frp_max_mw": day.get("viirs_frp_max", 0),
                "confidence_breakdown": day.get("confidence", {}),
                "daynight_breakdown": day.get("daynight", {}),
            },
            "modis_calibrated": {
                "detection_count": modis_cal_count,
                "frp_sum_mw": modis_cal_frp,
                "note": "Calibrated equivalent via Schroeder et al. 2014 ratio (VIIRS/3.8)",
            },
        },
        "harmonization": {
            "hai": day["hai"],
            "anomaly_score": day["anomaly_score"],
            "anomaly_class": day["anomaly_class"],
            "anomaly_code": day["anomaly_code"],
            "monthly_baseline": month_norm,
        },
        "top_hotspots": hotspots[:50],
        "hotspot_count": len(hotspots),
    }


# ---------------------------------------------------------------------------
# Sensor Comparison Laboratory
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/sensor-comparison", tags=["Sensor Lab"])
def get_sensor_comparison(
    region_id: str,
    year: int | None = None,
):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"series": []}

    all_days = data_store.get_all_days()
    if year:
        all_days = [d for d in all_days if d["year"] == year]

    series = []
    for d in all_days:
        modis_info = d.get("modis") if isinstance(d.get("modis"), dict) else {}
        modis_cal = d.get("modis_calibrated_count", round(modis_info.get("count", 0) * 3.8))
        modis_frp = d.get("modis_calibrated_frp", round(modis_info.get("frp_sum", 0.0) * 1.14, 1))
        series.append({
            "date": d["date"],
            "viirs_count": d.get("viirs_count", d.get("count", 0)),
            "modis_calibrated_count": modis_cal,
            "viirs_frp": d.get("viirs_frp_sum", d.get("frp_sum", 0)),
            "modis_calibrated_frp": modis_frp,
            "hai": d["hai"],
            "anomaly_score": d["anomaly_score"],
        })

    # Correlation coefficient between VIIRS and MODIS calibrated counts
    if len(series) > 2:
        import statistics
        viirs = [s["viirs_count"] for s in series]
        modis = [s["modis_calibrated_count"] for s in series]
        mean_v = statistics.mean(viirs)
        mean_m = statistics.mean(modis)
        cov = sum((v - mean_v) * (m - mean_m) for v, m in zip(viirs, modis)) / len(viirs)
        std_v = statistics.stdev(viirs)
        std_m = statistics.stdev(modis)
        correlation = round(cov / (std_v * std_m + 1e-10), 4) if std_v > 0 and std_m > 0 else None
    else:
        correlation = None

    return {
        "region_id": region_id,
        "year_filter": year,
        "total_days": len(series),
        "calibration": {
            "method": "Schroeder et al. 2014 empirical ratio",
            "count_ratio": 3.8,
            "frp_ratio": 0.88,
            "note": "MODIS 1km pixels vs VIIRS 375m pixels - VIIRS detects ~3.8x more fires over identical grids",
            "correlation_viirs_modis": correlation,
        },
        "series": series,
    }


# ---------------------------------------------------------------------------
# Anomalies
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/anomalies", tags=["Analysis"])
def get_anomalies(
    region_id: str,
    code: str = Query(default="HIGH", enum=["HIGH", "ELEVATED", "LOW"]),
    limit: int = Query(default=50, le=500),
):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"anomalies": []}

    all_days = data_store.get_all_days()
    matching = [
        {
            "date": d["date"],
            "year": d["year"],
            "month": d["month"],
            "viirs_count": d["viirs_count"],
            "hai": d["hai"],
            "anomaly_score": d["anomaly_score"],
            "anomaly_class": d["anomaly_class"],
        }
        for d in all_days
        if d["anomaly_code"] == code
    ]
    matching.sort(key=lambda x: x["anomaly_score"], reverse=True)
    return {
        "region_id": region_id,
        "filter": code,
        "total_found": len(matching),
        "anomalies": matching[:limit],
    }


# ---------------------------------------------------------------------------
# Seasonal Profile
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/seasonal-profile", tags=["Analysis"])
def get_seasonal_profile(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"profile": []}

    all_days = data_store.get_all_days()
    baseline = data_store.get_baseline()

    MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    # Per-year monthly totals for stacked chart
    by_year_month: dict = {}
    for d in all_days:
        key = (d["year"], d["month"])
        if key not in by_year_month:
            by_year_month[key] = {"count": 0, "frp": 0.0, "days": 0}
        by_year_month[key]["count"] += d["viirs_count"]
        by_year_month[key]["frp"] += d["viirs_frp_sum"]
        by_year_month[key]["days"] += 1

    profile = []
    for m in range(1, 13):
        b = baseline.get(str(m), {})
        # Collect per-year monthly totals for this month
        yearly = []
        for year in range(2020, 2027):
            k = (year, m)
            if k in by_year_month:
                v = by_year_month[k]
                yearly.append({
                    "year": year,
                    "total_count": v["count"],
                    "total_frp": round(v["frp"], 1),
                    "days_observed": v["days"],
                    "mean_daily_count": round(v["count"] / max(v["days"], 1), 1),
                })
        profile.append({
            "month": m,
            "month_name": MONTH_NAMES[m - 1],
            "baseline_mean_daily": b.get("mean_count", 0),
            "baseline_std_daily": b.get("std_count", 0),
            "yearly_data": yearly,
        })

    return {
        "region_id": region_id,
        "profile": profile,
        "fire_seasons": {
            "pre_monsoon": "March - May (forest and shifting cultivation fires)",
            "monsoon": "June - September (suppressed by rainfall)",
            "post_monsoon": "October - December (agricultural residue burning, NW India)",
            "winter": "January - February (moderate biomass burning)",
        },
    }


# ---------------------------------------------------------------------------
# Spatial Grid
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/grid", tags=["Spatial"])
def get_grid(region_id: str, limit: int = Query(default=2000, le=5000)):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"cells": []}

    grid = data_store.get_grid()
    return {
        "region_id": region_id,
        "spatial_framework": "0.1 degree x 0.1 degree WGS84",
        "total_cells": len(grid),
        "cells": grid[:limit],
    }


# ---------------------------------------------------------------------------
# Predictive AI Forecasting (Phase 4)
# ---------------------------------------------------------------------------
@app.get("/api/regions/{region_id}/forecast", tags=["Predictive AI"])
def get_forecast(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    if region_id not in ("india", "asia"):
        return {"forecasts": [], "region_id": region_id}

    fc = data_store.get_forecast()
    if not fc:
        raise HTTPException(status_code=503, detail="Forecast model output not initialized")
    return fc


@app.get("/api/regions/{region_id}/model-accuracy", tags=["Predictive AI"])
def get_model_accuracy(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")

    ev = data_store.get_evaluation()
    if not ev:
        raise HTTPException(status_code=503, detail="Model evaluation metrics not initialized")
    return ev

