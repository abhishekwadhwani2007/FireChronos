# 🔥 FIRECHRONOS

> **One Planet. Three Satellite Constellations. One Harmonized Fire Intelligence Engine.**  
> *NASA Space Apps Challenge 2026 — Pan-Asian Multi-Sensor Wildfire Harmonization & Predictive Intelligence*

[![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-orange.svg)](https://www.spaceappschallenge.org/)
[![Authentic NASA FIRMS](https://img.shields.io/badge/NASA%20FIRMS-20.9M%20Records-blue.svg)](https://firms.modaps.eosdis.nasa.gov/)
[![Model R2](https://img.shields.io/badge/R%C2%B2%20Fit-95.3%25-cyan.svg)]()
[![ROC-AUC](https://img.shields.io/badge/ROC--AUC-0.868-emerald.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)

---

## 🌍 Overview

**FIRECHRONOS** is a pan-Asian active-fire intelligence platform bridging heterogeneous satellite records from **MODIS C6.1 (Terra/Aqua)**, **VIIRS NOAA-20 (J1)**, and **VIIRS NOAA-21 (J2)** into a unified, cross-sensor spatial-temporal analytical system.

Across complex Asian ecologies—spanning India, Pakistan, Afghanistan, Eastern Iran, China, Nepal, Bhutan, Sri Lanka, and Malaysia—differing spatial resolutions (MODIS 1 km nadir vs. VIIRS 375 m nadir) produce an empirical **6.91× detection count discrepancy**. Directly comparing raw records leads to severe false trend conclusions. FIRECHRONOS eliminates this sensor bias with multi-sensor spatial-energy harmonization and pairs it with a **95.3% R² dual-head AI forecasting engine** delivering 7-day predictive wildfire intelligence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTIC NASA FIRMS DATA STREAM                       │
│    MODIS C6.1 (2.04M)   │   VIIRS NOAA-20 (12.53M)   │  VIIRS NOAA-21 (6.37M) │
│               Total: 20,935,359 Authentic Satellite Observations            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │        EMPIRICAL RESOLUTION HARMONIZATION & ENERGY FUSION   │
        │    - 0.1° × 0.1° Spatial Discretization                     │
        │    - Empirical Scaling Ratio: α = 6.91×, FRP Ratio: γ = 0.88│
        │    - Harmonized Activity Index: HAI = 65% Count + 35% FRP   │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│     INTERACTIVE SCIENTIFIC UI         │   │   DUAL-HEAD PREDICTIVE AI       │
│  - Harmonized Activity Calendar       │   │  - Calibrated Classifier (0.868)│
│  - Leaflet Multi-Layer Map (OSM/Sat)  │   │  - Rolling Regressor: 95.3% R²  │
│  - Spatial Corridor Risk Localization │   │  - 7-Day Regional Geographic FC │
│  - Cross-Sensor Calibration Lab       │   │  - Multi-Harmonic Seasonality   │
└───────────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 🚀 Key Modules

### 📅 1. Harmonized Burning Activity Calendar
- Daily matrix covering **2,509 calendar days (2020–2026)**.
- Real-time toggle across **Harmonized Activity Index (HAI)**, **Raw VIIRS NOAA-20**, and **Calibrated MODIS C6.1**.
- Climatological anomaly detection: identifies deviations relative to month-specific baselines ($Z \ge +2.0$).
- Modal drilldown for any day: inspect satellite pass counts, day/night ratios, confidence distributions, and coordinates of extreme thermal hotspots (FRP ≥ 150 MW).

### 🔮 2. 7-Day AI Burning Activity Forecast
- Dual-head machine learning architecture (Extreme Gradient Boosting + HistGradientBoosting ensemble).
- **Classifier Head:** Predicts elevated fire conditions with **100.0% precision** at operational decision threshold ($T=0.70$) and **90.3% overall accuracy** (ROC-AUC 0.8681).
- **Regressor Head:** Predicts future daily Harmonized Activity Index (HAI) with **$R^2 = 0.953$ (95.3%)** and Mean Absolute Error of **1.50 HAI points**.
- Multi-horizon forecasts ($t+1$, $t+3$, $t+7$ days) with $90\%$ prediction intervals and categorical risk tiers (`CRITICAL`, `ELEVATED`, `NOMINAL`, `SUPPRESSED`).

### 🗺️ 3. Pan-Asian Geospatial Grid
- High-performance Leaflet spatial visualization displaying **2,500 active 0.1° × 0.1° analytical grid cells**.
- One-click corridor presets:
  - **All Asia AOI** (52.1°E to 109.9°E, 4.7°N to 40.9°N)
  - **Indo-Gangetic Residue Plains** (Punjab, Haryana, Uttar Pradesh)
  - **Central Deciduous Forests** (Madhya Pradesh, Odisha, Chhattisgarh)
  - **China Agricultural Basin** (Central & Southern China)
  - **Malaysia & Sundaland** (Peninsular Malaysia, peatland fire zones)
  - **Eastern Iran / Baluchistan Arid Corridor**
- Dynamic Fire Radiative Power (FRP) energy slider filter (0 to 25,000+ MW).

### 🛰️ 4. Sensor Comparison Laboratory
- Synchronized time series analyzing concurrent MODIS and VIIRS passes.
- Empirical correlation proof ($r = 0.997$, $p < 0.001$).
- Resolution ratio analysis: VIIRS 375m pixels cover $0.14\text{ km}^2$ vs MODIS $1.0\text{ km}^2$ at nadir, detecting small agricultural fires and low-intensity understory burns that evade 1 km MODIS detection.

### 📈 5. Historical Climatological Trends
- 12-month multi-year baseline envelopes ($\mu \pm 1\sigma$).
- Captures spring fire peaks, monsoon quenching, and post-monsoon stubble burns across the Asian landmass.

### 🔬 6. Scientific Data Center
- Full NASA FIRMS citation details (`M-C61`, `J1V-C2`, `J2V-C2`).
- Exportable harmonized datasets for peer review and research replication.

---

## 📊 Scientific Verification & Calibration Metrics

All models were evaluated using chronological out-of-time holdouts (Train: 2020–June 2025 [1,978 days]; Test: July 2025–Nov 2026 [494 days]) to prevent temporal data leakage:

| Metric | Target | Achieved | Operational Context |
|---|---|---|---|
| **Continuous HAI Regressor ($R^2$)** | $\ge 90.0\%$ | **95.3%** ($R^2 = 0.953$) | High reliability across 1d/3d/7d horizons |
| **Regression MAE** | $< 3.0$ pts | **1.50 HAI pts** | Standardized 0–100 HAI scale |
| **Classifier ROC-AUC** | $\ge 0.85$ | **0.8681** | Strong ranking discrimination across all thresholds |
| **Holdout Classification Accuracy** | $\ge 85.0\%$ | **89.3%** | 441/494 holdout days correctly classified |
| **Operational High-Confidence Alert ($T=0.50$)** | Baseline | **65.5% – 92.3%** | Honest precision curve with documented false alarms |
| **Total Authentic NASA Observations** | Multi-million | **20,935,359** | Fully ingested & harmonized |

---

## 👥 Dual-Team Repository Architecture

FIRECHRONOS is structured for parallel work between the **Model Team** and the **Frontend Team**:

```
FIRECHRONOS/
├── scripts/             ← [Model Team] ETL, feature engineering, training, forecasting
├── models/              ← [Model Team] Evaluation reports & serialized weights
├── backend/             ← [Shared] FastAPI endpoints & memory-mapped store
│   ├── main.py
│   └── data_store.py
├── frontend/            ← [Frontend Team] React 19 + TypeScript + Vite + Tailwind 4
│   └── src/
│       ├── api.ts       ← [Frontend Team] Fetch wrappers
│       ├── types.ts     ← [Frontend Team] Shared data interfaces
│       └── components/  ← [Frontend Team] UI modules (Calendar, Map, Forecast)
├── CONTRIBUTING.md      ← Two-team collaboration and PR rules
├── BRANCH_STRATEGY.md   ← Branch workflow (`model/*` & `frontend/*`)
└── MERGE.md             ← Step-by-step merge verification checklist
```

Please consult:
- [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch guidelines and team responsibilities.
- [`BRANCH_STRATEGY.md`](BRANCH_STRATEGY.md) for PR workflows.
- [`MERGE.md`](MERGE.md) for pre-merge checklists to prevent cross-team regression.

---

## 🛠️ Quickstart

### Prerequisites
- Python 3.11+
- Node.js 20+
- Authentic NASA FIRMS CSVs placed in `data/raw/`

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Model Pipeline Execution (Model Team)
```bash
# 1. Run Pan-Asian Multi-Sensor ETL (MODIS + VIIRS N20 + VIIRS N21)
python scripts/etl_asia_multisensor.py

# 2. Extract 87 Astronomical, Climatological, and Cross-Sensor Features
python scripts/build_features.py

# 3. Train Dual-Head Classifier and Multi-Horizon Regressor
python scripts/train_model.py

# 4. Generate 7-Day Rolling Risk Forecast
python scripts/forecast.py
```

---

## 📜 Citations & Authentic Data Attribution

1. **NASA FIRMS**: Active Fire Data courtesy of NASA's Earth Observing System Data and Information System (EOSDIS) Land, Atmosphere Near real-time Capability for EOS (LANCE).
2. **Schroeder, W., et al. (2014)**: *The New VIIRS 375 m active fire detection product*. Remote Sensing of Environment, 143, 85-96.
3. **Giglio, L., et al. (2016)**: *The Collection 6 MODIS active fire detection algorithm and fire products*. Remote Sensing of Environment, 178, 31-41.

---
*Developed for NASA Space Apps Challenge 2026 — Track: Harmonization of Multi-Sensor Hotspot Data.*
