# FIRECHRONOS — Technical Requirements Document (TRD)

## 1. Data Sources (Authoritative)

| Product              | Sensor          | Resolution | Coverage Start     | Notes                          |
|----------------------|-----------------|------------|--------------------|--------------------------------|
| MODIS C6.1           | Terra + Aqua    | ~1 km      | Nov 2000           | Combined product               |
| VIIRS NOAA-20 (J1)   | VIIRS           | 375 m      | Apr 2018           | Primary VIIRS source           |
| VIIRS NOAA-21 (J2)   | VIIRS           | 375 m      | ~2023/2024         | Continuity                     |

**Primary access method:** FIRMS Archive Download (CSV) + FIRMS Area API (with MAP_KEY) for recent data.

**Required fields to preserve:**
latitude, longitude, acq_date, acq_time, satellite, instrument, confidence, frp, brightness / bright_ti4, bright_t31 / bright_ti5, daynight, version, type

## 2. Harmonization Rules (Non-negotiable)

1. Never discard sensor identity.
2. Common spatial grid: 0.1° × 0.1° (or 0.25° for very large regions) aggregation cells.
3. Common temporal unit: Calendar day (UTC).
4. Activity indicators:
   - Raw count of detections per cell per day (sensor-specific)
   - FRP-sum per cell per day (sensor-specific)
   - Harmonized Activity Index (HAI) = normalized combination after sensor-specific scaling
5. Confidence filtering: optional low-confidence filter (default = keep all, show confidence distribution).

## 3. System Architecture

```
Frontend (Next.js / React)
    ↓
API Layer (FastAPI or Next.js API routes)
    ↓
Data Layer
  ├── Pre-processed Parquet / DuckDB / SQLite (regional extracts)
  ├── FIRMS live API (recent 7–30 days)
  └── Harmonization Engine (Python)
```

## 4. Performance Requirements

- Regional query (India-sized) for 1 year of daily data → < 3 seconds.
- Map tile / layer switch → < 1 second.
- Calendar render for 5 years → < 2 seconds.
- Pre-compute regional aggregates offline so the live app never scans the full 4M+ row CSV.

## 5. Technology Stack (Recommended)

**Frontend**
- Next.js 14+ (App Router)
- MapLibre GL JS or React-Leaflet
- Recharts / Observable Plot / custom calendar heatmap
- Tailwind CSS + shadcn/ui
| React | Application framework |
| TypeScript | Type safety |
| Vite | Development and build |
| Apache ECharts | Scientific charts |
| TanStack Query | API data fetching and caching |
| React Router | Navigation |
| Zod | Runtime validation |

**Backend / Data**
- Python 3.11+
- Pandas + GeoPandas + DuckDB (or Polars)
- FastAPI (if separate backend) or Next.js Route Handlers
- Pre-generated Parquet files per region + year
Backend

| Technology | Purpose |
|---|---|
| Python | Scientific programming |
| FastAPI | Backend API |
| Pydantic | Data validation |
| SQLAlchemy | Database access |
| Alembic | Database migrations |
| Requests or HTTPX | NASA API integration |
| Uvicorn | Application server |

## 4. Scientific computing

| Technology | Purpose |
|---|---|
| NumPy | Numerical computation |
| Pandas | Tabular data |
| SciPy | Statistical calculations |
| GeoPandas | Geospatial processing |
| Shapely | Geometry operations |
| PyProj | Coordinate transformations |
| Scikit-learn | Optional ML |
| DuckDB | Local analytical queries |

Use Rasterio only if raster processing becomes necessary.

** Database **
**Preferred:** PostgreSQL + PostGIS.

Responsibilities:

- Raw observation storage.
- Regional data.
- Harmonized aggregates.
- Historical baselines.
- Data provenance.
- Geographic queries.

If database provisioning becomes a blocker, use DuckDB for local analytical processing and SQLite for a small prototype. Keep database access modular so that migration remains possible.

**Deployment**
- Vercel (frontend) + Railway / Render / local for data services
- Or full Docker Compose for local demo

## 6. Data Pipeline Stages

1. Ingest CSV → validate → add `sensor_family` column (`MODIS` / `VIIRS_N20` / `VIIRS_N21`)
2. Spatial join to 0.1° grid cells
3. Daily aggregation (count, sum_frp, mean_confidence)
4. Sensor-normalization factors (computed from overlapping period)
5. Harmonized Activity Index calculation
6. Store as Parquet / DuckDB tables ready for API

## 7. Security & Compliance

- No user authentication required for hackathon.
- Cite NASA FIRMS in every view and in the Scientific Data Center page.
- Do not redistribute the raw CSVs publicly without NASA attribution.

---

Maps and visualization

Primary map: MapLibre GL JS.

Use:

- Satellite observation points.
- Cluster layers.
- Density layers.
- Region boundaries.
- Geographic selection.
- Sensor-specific layers.

Charts:

- Daily activity.
- Monthly activity.
- Yearly trends.
- Seasonal profiles.
- MODIS–VIIRS comparisons.
- Anomaly analysis.

**Document Owner:** Tech Lead  
**Last Updated:** 13 November 2026  
