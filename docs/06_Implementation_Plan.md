# FIRECHRONOS — 10-Hour Implementation Plan

**Total focused build time:** 10 hours  
**Goal:** Working end-to-end demo with real India data by the end of the session.

---

## Hour 0–1.5 : Data Foundation (Critical Path)

- Clean the J1 (NOAA-20) CSV → add `sensor_family = "VIIRS_N20"`
- When MODIS + J2 arrive, do the same
- Create 0.1° daily grid aggregates for India (2020–2026)
- Save as Parquet / DuckDB
- Quick validation: total detections per year look reasonable

**Output:** `india_daily_grid.parquet` ready for API

## Hour 1.5–3 : Minimal Backend + API

- Simple FastAPI or Next.js API routes
- Endpoints:
  - `GET /api/regions/india/calendar?from=&to=&mode=harmonized|raw`
  - `GET /api/regions/india/day/{date}`
- Pre-load the Parquet into memory or DuckDB
- Return JSON that the frontend can consume directly

## Hour 3–5.5 : Core Frontend (Calendar is King)

- Next.js + Tailwind scaffold
- Dark theme
- Landing page with big “Explore India” button
- Regional view layout
- **Calendar heatmap** (daily view) that actually renders real data
- Sensor toggle buttons (MODIS / VIIRS / Harmonized) that switch the data source

## Hour 5.5–7.5 : Interaction + Polish

- Hover tooltip on calendar cells (show counts + FRP)
- Click day → simple detail panel / drawer
- Basic metrics cards (total detections, peak day, sensor split)
- Loading & empty states
- NASA attribution footer

## Hour 7.5–9 : Sensor Lab + Methodology

- Simple side-by-side time-series chart (MODIS vs VIIRS)
- Static “Scientific Data Center” page with exact product names, versions, and download dates
- Export current view as CSV (nice-to-have)

## Hour 9–10 : Demo Ready

- Fix critical bugs only
- Record 30–45 second happy-path video
- Prepare 5–7 slide pitch (Problem → Solution → Live Demo → How it works → What’s next)
- Deploy (Vercel + static data files is enough)

---

## Strict Priority Order (If time runs short)

1. Data pipeline + calendar with real numbers
2. Sensor toggle that changes the view
3. Day click detail
4. Everything else is secondary

## Definition of Done (10-hour version)

- [ ] Landing → click India → calendar appears with real 2020–2026 data
- [ ] Can switch between at least two sensor views
- [ ] Can click a day and see actual detection counts
- [ ] Methodology page lists the NASA products used
- [ ] App is deployed or runnable locally for judges

---

**Document Owner:** Project Lead  
**Last Updated:** 13 November 2026 (10-hour focused version)
