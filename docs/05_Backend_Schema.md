# FIRECHRONOS — Backend / Data Schema

## 1. Raw Ingestion Tables (one-time)

### `raw_detections`
| Column          | Type          | Notes                          |
|-----------------|---------------|--------------------------------|
| id              | UUID / BigInt | Primary key                    |
| latitude        | Float64       |                                |
| longitude       | Float64       |                                |
| acq_date        | Date          |                                |
| acq_time        | String/Int    | HHMM                           |
| satellite       | String        | N20 / N21 / Terra / Aqua       |
| instrument      | String        | VIIRS / MODIS                  |
| sensor_family   | String        | MODIS / VIIRS_N20 / VIIRS_N21  |
| confidence      | String/Float  | n/l/h or 0–100                 |
| frp             | Float64       | Fire Radiative Power           |
| brightness      | Float64       |                                |
| bright_t31      | Float64       |                                |
| daynight        | Char          | D / N                          |
| version         | String        |                                |
| type            | Int           | 0=vegetation, etc.              |
| source_file     | String        | original zip name              |

## 2. Aggregated Tables (serving layer)

### `grid_daily`
Spatial resolution: 0.1° × 0.1° (approx 11 km)

| Column            | Type     | Notes                              |
|-------------------|----------|------------------------------------|
| grid_id           | String   | e.g. "G_22.35_72.45"               |
| lat_center        | Float    |                                    |
| lon_center        | Float    |                                    |
| acq_date          | Date     |                                    |
| sensor_family     | String   |                                    |
| detection_count   | Int      |                                    |
| sum_frp           | Float    |                                    |
| mean_confidence   | Float    |                                    |
| region_id         | String   | "india" / "california" / "amazon"  |

### `harmonized_daily`
| Column              | Type   | Notes                                      |
|---------------------|--------|--------------------------------------------|
| grid_id             | String |                                            |
| acq_date            | Date   |                                            |
| region_id           | String |                                            |
| modis_count         | Int    |                                            |
| viirs_n20_count     | Int    |                                            |
| viirs_n21_count     | Int    |                                            |
| total_raw_count     | Int    |                                            |
| sum_frp_all         | Float  |                                            |
| hai                 | Float  | Harmonized Activity Index (0–1 or scaled)  |
| anomaly_score       | Float  | vs multi-year baseline                     |

## 3. Region Metadata

### `regions`
| Column       | Type   |
|--------------|--------|
| region_id    | String |
| name         | String |
| bbox         | JSON   | [minLon, minLat, maxLon, maxLat] |
| demo         | Bool   |

## 4. Recommended Storage

- Development / Demo: DuckDB or SQLite + Parquet files
- Production-ish: DuckDB on disk or Postgres + PostGIS if time allows

## 5. API Endpoints (minimal)

```
GET /api/regions
GET /api/regions/{id}/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&mode=harmonized|raw
GET /api/regions/{id}/day/{date}
GET /api/regions/{id}/sensor-comparison
GET /api/meta/sources
```

---

**Document Owner:** Backend Lead  
**Last Updated:** 13 November 2026  
