# FIRECHRONOS — Contributor Guide

> NASA FIRMS · Pan-Asian Fire Intelligence · NASA Space Apps 2026

---

## Two-Team Structure

| Team | Owns | Branch prefix |
|------|------|---------------|
| **Model Team** | `scripts/`, `models/`, `data/`, `backend/` | `model/` |
| **Frontend Team** | `frontend/src/`, `frontend/public/` | `frontend/` |

### Shared / Interface files (arbitrated by **Frontend Team**)
- `backend/main.py` — API surface
- `backend/data_store.py` — data contracts
- `frontend/src/api.ts` — fetch wrappers
- `frontend/src/types.ts` — TypeScript types

**Rule:** Any change to a shared file must be discussed in a PR comment *before* merge.

---

## Branch Naming

```
model/feature-name        ← model team work
frontend/feature-name     ← frontend team work
hotfix/description        ← emergency fix on either side
```

`main` = production-ready only. Never push broken code to `main`.

---

## Before Opening a PR

### Model Team checklist
- [ ] `python scripts/etl_asia_multisensor.py` — exits 0, prints row counts
- [ ] `python scripts/build_features.py` — exits 0, writes `ml_features.csv`
- [ ] `python scripts/train_model.py` — precision ≥ 90%, accuracy ≥ 90%
- [ ] `python scripts/forecast.py` — writes `forecast_7day.json`
- [ ] `pytest backend/tests/` (if tests exist) — all pass
- [ ] Updated `models/evaluation_report.json` committed

### Frontend Team checklist
- [ ] `cd frontend && npm run build` — exits 0, zero TypeScript errors
- [ ] `npm run lint` — no errors
- [ ] Tested on Chrome at `localhost:5173` — map renders, tabs work
- [ ] No `console.error` output in browser dev tools

---

## Commit Message Format

```
type(scope): short description

feat(model): add VIIRS NOAA-21 sensor fusion
fix(frontend): resolve Leaflet double-mount in StrictMode
chore(data): move raw CSVs to data/raw/
```

Types: `feat`, `fix`, `chore`, `docs`, `perf`, `refactor`

---

## Getting Started

```bash
# Clone
git clone <repo-url>
cd FIRECHRONOS

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

See `README.md` for full data pipeline setup.
