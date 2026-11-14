"""
FIRECHRONOS Phase 4 - High-Precision Multi-Sensor Feature Engineering
Builds high-dimensional ML-ready feature matrix from pan-asian harmonized calendar.
Incorporates:
  - Multi-sensor cross-detection ratios (MODIS C6.1 vs VIIRS NOAA-20 vs NOAA-21)
  - 15-day temporal lags & multi-scale EMAs (3d, 7d, 14d, 28d)
  - Fourier annual, semi-annual, and quarterly harmonics
  - Dynamic climatological baselines and Z-score departures
  - Day/Night burning progression & FRP intensity ratios
"""

import json
import math
import numpy as np
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PROCESSED = BASE / "data" / "processed"

print("=" * 70)
print("FIRECHRONOS: Multi-Sensor Feature Engineering Pipeline")
print("=" * 70)

# Load calendar
with open(PROCESSED / "india_daily_calendar.json", encoding="utf-8") as f:
    days = json.load(f)

print(f"Loaded {len(days):,} calendar days")

# Build base DataFrame
records = []
for d in days:
    date_str    = d["date"]
    day_of_year = pd.Timestamp(date_str).day_of_year

    conf  = d.get("confidence", {}) or {}
    dn    = d.get("daynight",   {}) or {}
    modis = d.get("modis",      {}) or {}
    n20   = d.get("viirs_n20",  {}) or {}
    n21   = d.get("viirs_n21",  {}) or {}

    total_count = float(d.get("total_detections", d.get("viirs_count", 0)) or 0)
    frp_sum     = float(d.get("total_frp_mw", d.get("viirs_frp_sum", 0.0)) or 0.0)
    frp_mean    = float(d.get("viirs_frp_mean", 0.0) or 0.0)
    frp_max     = float(d.get("viirs_frp_max", 0.0) or 0.0)

    m_cnt   = float(modis.get("count", 0) or 0)
    n20_cnt = float(n20.get("count", 0) or 0)
    n21_cnt = float(n21.get("count", 0) or 0)

    conf_high = float(conf.get("high", 0) or 0)
    conf_nom  = float(conf.get("nominal", 0) or 0)
    conf_low  = float(conf.get("low", 0) or 0)

    day_count   = float(dn.get("day", 0) or 0)
    night_count = float(dn.get("night", 0) or 0)

    records.append({
        "date":          date_str,
        "year":          int(d.get("year", date_str[:4])),
        "month":         int(d.get("month", date_str[5:7])),
        "day":           int(d.get("day", date_str[8:10])),
        "day_of_year":   day_of_year,
        "hai":           float(d.get("hai", 0.0) or 0.0),
        "anomaly_score": float(d.get("anomaly_score", 0.0) or 0.0),
        "anomaly_code":  str(d.get("anomaly_code", "NORMAL") or "NORMAL"),
        "total_count":   total_count,
        "frp_sum":       frp_sum,
        "frp_mean":      frp_mean,
        "frp_max":       frp_max,
        "modis_count":   m_cnt,
        "n20_count":     n20_cnt,
        "n21_count":     n21_cnt,
        "conf_high":     conf_high,
        "conf_nom":      conf_nom,
        "conf_low":      conf_low,
        "day_count":     day_count,
        "night_count":   night_count,
    })

df = pd.DataFrame(records)
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date").reset_index(drop=True)

print(f"Date range: {df['date'].min().date()} to {df['date'].max().date()}")
print(f"HAI range : min={df['hai'].min():.1f}, max={df['hai'].max():.1f}, mean={df['hai'].mean():.1f}")

# 1. Climatological DOY Baseline (15-day smoothed circular expectation on historical split)
split_date = pd.Timestamp("2025-07-01")
train_mask = df["date"] < split_date
doy_stats = df[train_mask].groupby("day_of_year")["hai"].agg(["mean", "std"]).reset_index()
doy_grid  = pd.DataFrame({"day_of_year": range(1, 367)}).merge(doy_stats, on="day_of_year", how="left").bfill().ffill()

smooth_mean = np.convolve(np.tile(doy_grid["mean"].values, 3), np.ones(15)/15, mode="same")[366:366+366]
smooth_std  = np.convolve(np.tile(doy_grid["std"].values, 3), np.ones(15)/15, mode="same")[366:366+366]
climatology_mean_map = dict(zip(range(1, 367), smooth_mean))
climatology_std_map  = dict(zip(range(1, 367), smooth_std))

df["climatology_expected_hai"] = df["day_of_year"].map(climatology_mean_map)
df["climatology_std_hai"]      = df["day_of_year"].map(climatology_std_map)

# 2. Multi-Sensor Ratios & Concurrence
df["daynight_ratio"]  = df["day_count"] / (df["day_count"] + df["night_count"] + 1)
df["conf_high_ratio"] = df["conf_high"] / (df["total_count"] + 1)
df["conf_low_ratio"]  = df["conf_low"]  / (df["total_count"] + 1)
df["frp_per_spot"]    = df["frp_sum"]   / (df["total_count"] + 1)
df["frp_max_ratio"]   = df["frp_max"]   / (df["frp_mean"] + 1)

df["modis_share"] = df["modis_count"] / (df["total_count"] + 1)
df["n20_share"]   = df["n20_count"]   / (df["total_count"] + 1)
df["n21_share"]   = df["n21_count"]   / (df["total_count"] + 1)
df["sensor_concurrence"] = (
    (df["modis_count"] > 0).astype(int) +
    (df["n20_count"] > 0).astype(int) +
    (df["n21_count"] > 0).astype(int)
)

# 3. Fourier Multi-Harmonics (Annual, Semi-Annual, 4-Month, 3-Month)
for k in [1, 2, 3, 4]:
    df[f"sin_doy_k{k}"] = np.sin(2 * math.pi * k * df["day_of_year"] / 365.25)
    df[f"cos_doy_k{k}"] = np.cos(2 * math.pi * k * df["day_of_year"] / 365.25)
df["sin_month"] = np.sin(2 * math.pi * df["month"] / 12)
df["cos_month"] = np.cos(2 * math.pi * df["month"] / 12)

# 4. Lag Features (Shifted to prevent any data leakage)
print("Constructing temporal lag sequences...")
for lag in range(1, 16):
    df[f"hai_lag_{lag}"] = df["hai"].shift(lag)
for lag in [1, 2, 3, 5, 7]:
    df[f"frp_lag_{lag}"]   = df["frp_sum"].shift(lag)
    df[f"count_lag_{lag}"] = df["total_count"].shift(lag)

# 5. Multi-Scale Exponential Moving Averages (EMA) on shift(1)
hai_s1 = df["hai"].shift(1)
df["hai_ema3"]  = hai_s1.ewm(span=3).mean()
df["hai_ema7"]  = hai_s1.ewm(span=7).mean()
df["hai_ema14"] = hai_s1.ewm(span=14).mean()
df["hai_ema28"] = hai_s1.ewm(span=28).mean()

# 6. Climatological Residuals
df["climatology_residual"] = hai_s1 - df["climatology_expected_hai"]
df["climatology_z"]        = (hai_s1 - df["climatology_expected_hai"]) / (df["climatology_std_hai"] + 0.1)

# 7. Rolling Envelopes (shift 1)
df["hai_roll7_mean"]   = hai_s1.rolling(7).mean()
df["hai_roll7_std"]    = hai_s1.rolling(7).std()
df["hai_roll7_max"]    = hai_s1.rolling(7).max()
df["hai_roll7_min"]    = hai_s1.rolling(7).min()
df["hai_roll7_spread"] = df["hai_roll7_max"] - df["hai_roll7_min"]
df["hai_roll14_mean"]  = hai_s1.rolling(14).mean()
df["hai_roll14_max"]   = hai_s1.rolling(14).max()
df["hai_roll30_mean"]  = hai_s1.rolling(30).mean()
df["frp_roll7_mean"]   = df["frp_sum"].shift(1).rolling(7).mean()
df["count_roll7_mean"] = df["total_count"].shift(1).rolling(7).mean()

# 8. Momentum & Acceleration
df["hai_delta1"] = hai_s1 - df["hai"].shift(2)
df["hai_delta3"] = hai_s1 - df["hai"].shift(4)
df["hai_delta7"] = hai_s1 - df["hai"].shift(8)
df["hai_accel"]  = df["hai_delta1"] - (df["hai"].shift(2) - df["hai"].shift(3))

# 9. Anomaly Categorical Flags
df["is_high"]     = (df["anomaly_code"] == "HIGH").astype(int)
df["is_elevated"] = (df["anomaly_code"] == "ELEVATED").astype(int)
df["is_low"]      = (df["anomaly_code"] == "LOW").astype(int)

# 10. Multi-Horizon Targets
df["hai_next1"] = df["hai"].shift(-1)
df["hai_next3"] = df["hai"].shift(-3)
df["hai_next7"] = df["hai"].shift(-7)
# High Anomaly classification target: HAI >= 60.0 or Anomaly=HIGH
df["is_high_anomaly_next1"] = (df["hai_next1"] >= 60.0).astype(int)

# Drop boundary NaNs
n_before = len(df)
df = df.dropna().reset_index(drop=True)
n_after = len(df)
print(f"Dropped {n_before - n_after} boundary rows -> {n_after:,} clean samples")

# Save outputs
out_csv  = PROCESSED / "ml_features.csv"
out_meta = PROCESSED / "ml_features_meta.json"
df.to_csv(out_csv, index=False)
print(f"Saved feature matrix: {out_csv} ({len(df)} rows x {len(df.columns)} cols)")

feature_cols = [c for c in df.columns if c not in {"date", "anomaly_code", "hai_next1", "hai_next3", "hai_next7", "is_high_anomaly_next1"}]

meta = {
    "n_samples": len(df),
    "n_features": len(feature_cols),
    "date_min": str(df["date"].min().date()),
    "date_max": str(df["date"].max().date()),
    "targets": ["hai_next1", "hai_next3", "hai_next7", "is_high_anomaly_next1"],
    "feature_names": feature_cols,
    "climatology_mean_map": {str(k): round(float(v), 2) for k, v in climatology_mean_map.items()},
    "climatology_std_map":  {str(k): round(float(v), 2) for k, v in climatology_std_map.items()},
}
with open(out_meta, "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2)

print(f"Saved metadata: {out_meta}")
print("Feature Engineering COMPLETE [PASS]")
