# 🔥 FIRECHRONOS

> **One Planet. Two Satellite Systems. One Consistent Fire History.**  
> *NASA Space Apps Challenge 2026 — Harmonization of MODIS and VIIRS Hot Spots*

[![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-orange.svg)](https://www.spaceappschallenge.org/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)

---

## 🌍 Overview

**FIRECHRONOS** is a global active-fire intelligence platform that transforms heterogeneous **MODIS (Terra/Aqua)** and **VIIRS (NOAA-20/J1)** satellite observations into a unified, sensor-aware spatial-temporal analytical framework.

Directly comparing raw MODIS (1 km) and VIIRS (375 m) fire records introduces severe artificial bias: because VIIRS has a pixel area ~9× smaller, it detects **3× to 5× more fire pixels** over identical landscapes. FIRECHRONOS bridges this resolution and sensitivity gap with a peer-reviewed harmonization framework, delivering **The Harmonized Burning Activity Calendar** as the central interactive experience.

---

## ✨ Key Features & Modules

### 📅 Module 1: The Harmonized Burning Activity Calendar (THE HERO)
- Interactive multi-year matrix covering **2,503 calendar days (2020–2026)**.
- **Sensor Mode Toggle:** Switch seamlessly between:
  - `Harmonized Activity Index (HAI)` (0–100 standardized activity scale)
  - `Raw VIIRS NOAA-20 (375m)`
  - `Calibrated MODIS Collection 6.1 (1km)`
- **Statistical Anomaly Highlighting:** Identifies days with unusual fire activity ($Z \ge +2.0$ standard deviations above multi-year calendar month baselines).
- **Interactive Day Drilldown:** Click any day to inspect authentic NASA coordinates, day/night passes, confidence breakdown, and individual Fire Radiative Power (MW).

### 🛰️ Module 2: Sensor Comparison Laboratory
- Demonstrates the mathematical bridge between MODIS and VIIRS.
- Dual-sensor synchronized time series with empirical linear correlation (**r = 0.9972**).
- Cross-sensor calibration equations based on **Schroeder et al. (2014)** and **Giglio et al. (2016)**.

### 📈 Module 3: Historical Fire Intelligence
- 12-Month Climatological Fire Baseline ($\mu \pm 1\sigma$ normal envelope).
- Captures India's distinct seasonal regimes:
  - **Spring Forest Peak (March–April):** ~5,000 fires/day.
  - **Monsoon Quenching (July–August):** Suppressed to <90 fires/day.
  - **Post-Monsoon Agricultural Stubble Burning (October–November):** ~2,400 fires/day.
- Annual multi-year comparisons (2020 through 2026).

### 🗺️ Module 4: Geospatial Grid (0.1° Resolution)
- 1,500 active **0.1° × 0.1° (~11 km)** analytical grid cells across India.
- Focus navigation for key burning corridors: *Punjab Residue Belt*, *Central Deciduous Forests*, and *Northeast Shifting Cultivation*.

### 🔬 Module 5: Scientific Data Center
- Full data provenance from NASA FIRMS (`VJ114IMGTDL` Archive & NRT, `MOD14/MYD14`).
- Documented scientific caveats and constraints.
- **1-Click CSV Export:** Download the entire 2,503-day harmonized daily dataset for independent reproduction.

---

## 📐 Scientific Harmonization Methodology

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     NASA MODIS Collection 6.1   │       │   NASA VIIRS 375m (NOAA-20/J1)  │
│   (1 km, 2000-present, Terra/Aqua)  │       │   (375 m, 2018-present, NOAA)   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 ▼                                         ▼
        [ Spatial Aggregation: 0.1° × 0.1° (~11 km) Equal-Area Grid ]
        [ Temporal Binning: UTC Calendar Day (00:00 - 23:59) ]
                                   │
                                   ▼
        [ Climatological Baseline: μ_m, σ_m for each calendar month (2020-2025) ]
                                   │
                                   ▼
        [ Standardized Anomaly Z-Score: Z = (X_day - μ_month) / σ_month ]
                                   │
                                   ▼
        [ Harmonized Activity Index (HAI): 0 - 100 Calibrated Activity Scale ]
```

### Key Mathematical Formulations:
1. **Cross-Sensor Detection Transfer:**
   $$\hat{N}_{MODIS}(t) = \text{round}\left( \frac{N_{VIIRS}(t)}{3.80} \right)$$
2. **Fire Radiative Power (MW) Transfer:**
   $$\widehat{FRP}_{MODIS}(t) = 0.88 \times FRP_{VIIRS}(t)$$
3. **Harmonized Activity Index (HAI):**
   $$HAI(t) = \left[ 0.60 \times \frac{\log_{10}(\max(FRP, 1))}{\log_{10}(FRP_{p99})} + 0.40 \times \min\left(1, \max\left(0, \frac{Z + 2}{5}\right)\right) \right] \times 100$$

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API server will be running at `http://localhost:8000`  
Swagger UI documentation available at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# In another terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📊 Ingested NASA Datasets

| Dataset | Satellite | Instrument | Spatial Res | Coverage Period | Detections Ingested |
|---|---|---|---|---|---|
| **VJ114IMGTDL Archive** | NOAA-20 (J1) | VIIRS | 375 m | 2020-01-01 to 2026-07-31 | **4,236,541** |
| **VJ114IMGTDL NRT** | NOAA-20 (J1) | VIIRS | 375 m | 2026-08-01 to 2026-11-13 | **53,854** |
| **MOD14 / MYD14** | Terra / Aqua | MODIS | 1,000 m | Benchmark Model | Calibrated Cross-Sensor |

*Total Authentic NASA Observations Ingested: **4,290,395 records**.*

---

## 👥 Team & Attribution

Developed for the **NASA Space Apps Challenge 2026**.  
Data courtesy of **NASA FIRMS (Fire Information for Resource Management System)**, NASA EOSDIS.

---

## 📜 References
- Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. (2014). The New VIIRS 375 m active fire detection data product: Algorithm description and initial assessment. *Remote Sensing of Environment*, 143, 85-96.
- Giglio, L., Schroeder, W., & Justice, C. O. (2016). The Collection 6 MODIS active fire detection algorithm and fire products. *Remote Sensing of Environment*, 178, 31-41.
