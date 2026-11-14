# FIRECHRONOS — Project Status

**Event:** NASA Space Apps Challenge 2026  
**Category:** Earth Science / Geospatial Intelligence / Scientific Software  
**Tagline:** One Planet. Two Satellite Systems. One Consistent Fire History.  
**Updated:** 2026-11-14 12:25 IST  

---

## 🚀 Live Application Status

- **Production Cloud Deployment:** [https://firechronos.embarko.app](https://firechronos.embarko.app) (Permanent high-performance cloud hosting)
- **Web Frontend:** `http://localhost:5173` (Vite + React + TypeScript + Tailwind CSS)
- **API Server:** `http://localhost:8000` (FastAPI + Uvicorn + SQLite)
- **Interactive API Documentation:** `http://localhost:8000/docs` (Swagger UI)

---

## 📦 Progress Summary

### PHASE 1 — Data Foundation & Harmonization Engine [COMPLETE ✅]
- Ingested **4,290,395 authentic NASA FIRMS observations** (VIIRS NOAA-20 Archive + NRT).
- Continuous 7-year temporal coverage: **2020-01-01 to 2026-11-13 (2,503 calendar days)**.
- Established **0.1° × 0.1° (~11 km) WGS84 spatial reference grid** (top 1,500 active cells mapped).
- Derived **12-month multi-year climatological normal (2020–2025)**.
- Formulated the **Harmonized Activity Index (HAI 0–100)** and standardized anomaly Z-scores.
- Populated indexed SQLite database (`fire_events.db`) with 68,788 high-intensity fire events.
- All Phase 1 validation checks passed with zero missing dates or corrupt coordinates.

### PHASE 2 — Backend API [COMPLETE ✅]
- High-performance FastAPI server with in-memory serving cache (sub-millisecond queries).
- 10 REST endpoints implemented and 100% verified:
  - `GET /api/health`
  - `GET /api/meta/sources`
  - `GET /api/regions` & `GET /api/regions/{id}`
  - `GET /api/regions/india/calendar` (Supports mode=harmonized|viirs|modis)
  - `GET /api/regions/india/day/{date}` (Returns real hotspot coordinates for map drilldown)
  - `GET /api/regions/india/sensor-comparison` (Time series & linear correlation r=0.9972)
  - `GET /api/regions/india/anomalies` (Outlier classification)
  - `GET /api/regions/india/seasonal-profile` (Monthly fire regimes)
  - `GET /api/regions/india/grid` (0.1° spatial clusters)

### PHASE 3 — Interactive Scientific Web Application [COMPLETE ✅]
- **Navbar:** Brand identity, NASA Space Apps 2026 badge, live detection counter, tab navigation.
- **The Burning Activity Calendar (THE HERO):**
  - Multi-year matrix for all 2,503 days (2020–2026).
  - Sensor Mode Toggle: `[ Harmonized Index (HAI) ] [ VIIRS NOAA-20 ] [ MODIS Calibrated ]`.
  - Anomaly Filters: `[ All ] [ High Anomaly ] [ Elevated ] [ Normal ] [ Low ]`.
  - Rich hover tooltip with live date, HAI, detections, FRP, and Z-score.
  - Interactive click-to-inspect Day Detail Drawer.
- **Day Detail Drawer:**
  - Sensor comparison cards (VIIRS vs MODIS).
  - Real-time Leaflet mini-map rendering individual detected NASA hotspot points.
  - Raw NASA hotspot evidence table with latitude, longitude, UTC time, confidence, FRP, and brightness.
- **Sensor Comparison Laboratory:**
  - Dual line charts (VIIRS 375m vs Calibrated MODIS 1km).
  - Agreement scatter plot demonstrating empirical linearity.
  - Cross-sensor transfer equations (3.80× count factor, 0.88× FRP factor, Schroeder et al. 2014).
- **Historical Fire Intelligence:**
  - 12-month climatological baseline area chart (mean ± 1σ).
  - Annual total activity bar charts (2020–2026).
  - 4 distinct fire regimes cards (Pre-monsoon forest fires, Monsoon lull, Post-monsoon stubble burning, Winter).
  - Critical anomalies rankings with instant inspection links.
- **Geospatial Grid:**
  - Leaflet dark interactive map with 1,500 active 0.1° grid cells.
  - Quick focus shortcuts for key burning corridors (Punjab residue, Central forests, NE shifting cultivation).
- **Scientific Data Center:**
  - NASA FIRMS collection versions, citations, and data provenance.
  - Documented limitations (cloud obscuration, thermal hotspots vs confirmed wildfires).
  - One-click CSV Export button for the complete 2,503-day harmonized daily dataset.
