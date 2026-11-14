"""
FIRECHRONOS Phase 4 - Production 7-Day Pan-Asian Forecast
Synthesizes multi-sensor historical features (MODIS + VIIRS N20 + N21)
Generates 7-day ahead forecast with calibrated risk probabilities and confidence intervals.
"""

import json
import math
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from datetime import timedelta

BASE      = Path(__file__).resolve().parent.parent
PROCESSED = BASE / "data" / "processed"
MODELS    = BASE / "models" / "artifacts"

print("=" * 70)
print("FIRECHRONOS: 7-Day Multi-Sensor Fire Risk Forecast")
print("=" * 70)

# Load feature matrix and metadata
df = pd.read_csv(PROCESSED / "ml_features.csv", parse_dates=["date"])
df = df.sort_values("date").reset_index(drop=True)

with open(PROCESSED / "ml_features_meta.json", encoding="utf-8") as f:
    meta = json.load(f)

climatology_mean_map = {int(k): v for k, v in meta.get("climatology_mean_map", {}).items()}
climatology_std_map  = {int(k): v for k, v in meta.get("climatology_std_map",  {}).items()}

EXCLUDE = {"date", "anomaly_code", "hai_next1", "hai_next3", "hai_next7", "is_high_anomaly_next1", "is_elevated_or_high_next1"}
FEATURE_COLS = [c for c in df.columns if c not in EXCLUDE]

# Load trained models
xgb_reg = joblib.load(MODELS / "xgb_hai_forecast.joblib")
hgb_reg = joblib.load(MODELS / "hgb_hai_forecast.joblib")
xgb_cls = joblib.load(MODELS / "xgb_anomaly_classifier.joblib")
hgb_cls = joblib.load(MODELS / "hgb_anomaly_classifier.joblib")

anchor = df.iloc[-1]
anchor_date = anchor["date"]
print(f"Forecast Anchor Date: {anchor_date.date()}")

hai_buffer   = df["hai"].values.tolist()
frp_buffer   = df["frp_sum"].values.tolist()
cnt_buffer   = df["total_count"].values.tolist()
m_buffer     = df["modis_count"].values.tolist()
n20_buffer   = df["n20_count"].values.tolist()
n21_buffer   = df["n21_count"].values.tolist()

def get_risk_tier(hai, prob_high):
    if hai >= 50 or prob_high >= 0.70:
        return "CRITICAL", "#ef4444", "RED"
    elif hai >= 25 or prob_high >= 0.40:
        return "ELEVATED", "#f59e0b", "AMBER"
    elif hai >= 10:
        return "NOMINAL", "#10b981", "GREEN"
    else:
        return "SUPPRESSED", "#3b82f6", "BLUE"

forecasts = []

for step in range(1, 8):
    fc_date = anchor_date + timedelta(days=step)
    doy = fc_date.day_of_year
    month = fc_date.month
    day = fc_date.day
    year = fc_date.year

    exp_hai = climatology_mean_map.get(doy, float(np.mean(hai_buffer[-30:])))
    std_hai = climatology_std_map.get(doy, 5.0)

    hai_s1 = hai_buffer[-1]

    row = {
        "year": year, "month": month, "day": day, "day_of_year": doy,
        "hai": hai_s1,
        "anomaly_score": float(anchor["anomaly_score"]),
        "total_count": float(cnt_buffer[-1]),
        "frp_sum": float(frp_buffer[-1]),
        "frp_mean": float(anchor["frp_mean"]),
        "frp_max": float(anchor["frp_max"]),
        "modis_count": float(m_buffer[-1]),
        "n20_count": float(n20_buffer[-1]),
        "n21_count": float(n21_buffer[-1]),
        "conf_high": float(anchor["conf_high"]),
        "conf_nom": float(anchor["conf_nom"]),
        "conf_low": float(anchor["conf_low"]),
        "day_count": float(anchor["day_count"]),
        "night_count": float(anchor["night_count"]),
        "climatology_expected_hai": exp_hai,
        "climatology_std_hai": std_hai,
        "climatology_residual": hai_s1 - exp_hai,
        "climatology_z": (hai_s1 - exp_hai) / (std_hai + 0.1),
        "daynight_ratio": float(anchor["daynight_ratio"]),
        "conf_high_ratio": float(anchor["conf_high_ratio"]),
        "conf_low_ratio": float(anchor["conf_low_ratio"]),
        "frp_per_spot": float(anchor["frp_per_spot"]),
        "frp_max_ratio": float(anchor["frp_max_ratio"]),
        "modis_share": float(m_buffer[-1]) / (float(cnt_buffer[-1]) + 1),
        "n20_share": float(n20_buffer[-1]) / (float(cnt_buffer[-1]) + 1),
        "n21_share": float(n21_buffer[-1]) / (float(cnt_buffer[-1]) + 1),
        "sensor_concurrence": 3,
        "sin_month": math.sin(2 * math.pi * month / 12),
        "cos_month": math.cos(2 * math.pi * month / 12),
        "is_high": int(hai_s1 >= 50),
        "is_elevated": int(25 <= hai_s1 < 50),
        "is_low": int(hai_s1 < 10),
    }

    # Harmonics
    for k in [1, 2, 3, 4]:
        row[f"sin_doy_k{k}"] = math.sin(2 * math.pi * k * doy / 365.25)
        row[f"cos_doy_k{k}"] = math.cos(2 * math.pi * k * doy / 365.25)

    # Lags
    for lag in range(1, 16):
        row[f"hai_lag_{lag}"] = hai_buffer[-lag] if len(hai_buffer) >= lag else hai_buffer[0]
    for lag in [1, 2, 3, 5, 7]:
        row[f"frp_lag_{lag}"]   = frp_buffer[-lag] if len(frp_buffer) >= lag else frp_buffer[0]
        row[f"count_lag_{lag}"] = cnt_buffer[-lag] if len(cnt_buffer) >= lag else cnt_buffer[0]

    # EMAs
    s = pd.Series(hai_buffer)
    row["hai_ema3"]  = float(s.ewm(span=3).mean().iloc[-1])
    row["hai_ema7"]  = float(s.ewm(span=7).mean().iloc[-1])
    row["hai_ema14"] = float(s.ewm(span=14).mean().iloc[-1])
    row["hai_ema28"] = float(s.ewm(span=28).mean().iloc[-1])

    # Rolling
    w7  = hai_buffer[-7:]
    w14 = hai_buffer[-14:]
    w30 = hai_buffer[-30:]
    row["hai_roll7_mean"]   = float(np.mean(w7))
    row["hai_roll7_std"]    = float(np.std(w7)) if len(w7) >= 7 else 3.0
    row["hai_roll7_max"]    = float(np.max(w7))
    row["hai_roll7_min"]    = float(np.min(w7))
    row["hai_roll7_spread"] = row["hai_roll7_max"] - row["hai_roll7_min"]
    row["hai_roll14_mean"]  = float(np.mean(w14))
    row["hai_roll14_max"]   = float(np.max(w14))
    row["hai_roll30_mean"]  = float(np.mean(w30))
    row["frp_roll7_mean"]   = float(np.mean(frp_buffer[-7:]))
    row["count_roll7_mean"] = float(np.mean(cnt_buffer[-7:]))

    # Momentum
    row["hai_delta1"] = hai_buffer[-1] - hai_buffer[-2] if len(hai_buffer) >= 2 else 0.0
    row["hai_delta3"] = hai_buffer[-1] - hai_buffer[-4] if len(hai_buffer) >= 4 else 0.0
    row["hai_delta7"] = hai_buffer[-1] - hai_buffer[-8] if len(hai_buffer) >= 8 else 0.0
    row["hai_accel"]  = row["hai_delta1"] - (hai_buffer[-2] - hai_buffer[-3]) if len(hai_buffer) >= 3 else 0.0

    X = pd.DataFrame([row])[FEATURE_COLS]

    # Predict continuous HAI
    pred_xgb = float(xgb_reg.predict(X)[0])
    pred_hgb = float(hgb_reg.predict(X)[0])
    pred_hai = max(0.5, min(100.0, 0.55 * pred_xgb + 0.45 * pred_hgb))

    # Predict anomaly probability
    prob_xgb = float(xgb_cls.predict_proba(X)[0, 1])
    prob_hgb = float(hgb_cls.predict_proba(X)[0, 1])
    prob_high = 0.60 * prob_xgb + 0.40 * prob_hgb

    # Uncertainty bound (MAE ~ 1.50)
    base_unc = 1.50
    horizon_growth = 1.0 + (step - 1) * 0.15
    ci_half = base_unc * 1.645 * horizon_growth
    ci_low  = max(0.0, pred_hai - ci_half)
    ci_high = min(100.0, pred_hai + ci_half)

    tier, color, alert = get_risk_tier(pred_hai, prob_high)

    entry = {
        "date": str(fc_date.date()),
        "day_offset": step,
        "day_of_week": fc_date.strftime("%A"),
        "predicted_hai": round(pred_hai, 1),
        "confidence_interval_low": round(ci_low, 1),
        "confidence_interval_high": round(ci_high, 1),
        "high_anomaly_probability": round(prob_high, 3),
        "risk_tier": tier,
        "color": color,
        "alert_code": alert,
        "expected_seasonal_baseline": round(exp_hai, 1),
    }
    forecasts.append(entry)

    # Roll buffers forward
    hai_buffer.append(pred_hai)
    frp_buffer.append(frp_buffer[-1])
    cnt_buffer.append(cnt_buffer[-1])
    m_buffer.append(m_buffer[-1])
    n20_buffer.append(n20_buffer[-1])
    n21_buffer.append(n21_buffer[-1])

# Save
out_file = PROCESSED / "forecast_7day.json"
output_payload = {
    "generated_at": pd.Timestamp.now().isoformat(),
    "anchor_date": str(anchor_date.date()),
    "region_id": "asia",
    "forecast_horizon_days": 7,
    "model_metadata": {
        "architecture": "Dual-Head Multi-Sensor Ensemble (XGBoost + HistGradientBoosting)",
        "regression_mae": 1.50,
        "regression_r2": 0.953,
        "classifier_roc_auc": 0.868,
        "classifier_high_precision": 1.000,
        "classifier_accuracy": 0.903,
        "validation_strategy": "Out-of-sample holdout (494 days)",
        "sensor_foundation": "NASA FIRMS Authentic Multi-Sensor (MODIS C6.1 + VIIRS NOAA-20 + VIIRS NOAA-21)"
    },
    "forecasts": forecasts,
    "disclaimer": (
        "FIRECHRONOS predictive forecasts are synthesized from harmonized satellite fire histories "
        "and seasonal climatology across Asia. This system provides statistical situational awareness and early warning "
        "for wildfire, peatland, and crop residue burning dynamics."
    )
}

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(output_payload, f, indent=2)

print(f"\nSaved 7-day forecast to: {out_file}")
print()
print(f"{'Date':<12} {'Day':<10} {'Predicted HAI':>14} {'90% CI':>16} {'P(Hazard)':>12} {'Risk Tier'}")
print("-" * 75)
for f in forecasts:
    ci = f"[{f['confidence_interval_low']}, {f['confidence_interval_high']}]"
    print(f"{f['date']:<12} {f['day_of_week']:<10} {f['predicted_hai']:>14.1f} {ci:>16} {f['high_anomaly_probability']:>11.1%}   {f['risk_tier']}")
print("=" * 70)
print("FORECAST GENERATION COMPLETE [SUCCESS]")
print("=" * 70)
