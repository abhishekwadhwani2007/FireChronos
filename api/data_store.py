"""
FIRECHRONOS - In-memory data store for Vercel Serverless & Local.
Loads pre-computed JSON files once at startup.
"""

import json
import sqlite3
import os
from pathlib import Path

# Search multiple candidate directories for data/processed
CANDIDATE_BASES = [
    Path(__file__).resolve().parent / "data" / "processed",
    Path(__file__).resolve().parent.parent / "data" / "processed",
    Path.cwd() / "data" / "processed",
    Path.cwd() / "api" / "data" / "processed",
    Path("/var/task/api/data/processed"),
    Path("/var/task/data/processed"),
]

BASE = CANDIDATE_BASES[0]
for p in CANDIDATE_BASES:
    if p.exists() and (p / "india_daily_calendar.json").exists():
        BASE = p
        break

MODELS = Path(__file__).resolve().parent.parent / "models"
if not MODELS.exists():
    alt_m = Path.cwd() / "models"
    if alt_m.exists():
        MODELS = alt_m

_calendar: list[dict] = []
_calendar_by_date: dict[str, dict] = {}
_monthly_baseline: dict[str, dict] = {}
_grid: list[dict] = []
_metadata: dict = {}
_forecast: dict = {}
_evaluation: dict = {}


_loaded = False

def load_all():
    global _calendar, _calendar_by_date, _monthly_baseline, _grid, _metadata
    global _forecast, _evaluation, _loaded

    if _loaded and _calendar:
        return

    # 1. Calendar
    cal_file = BASE / "india_daily_calendar.json"
    if cal_file.exists():
        try:
            with open(cal_file, encoding="utf-8") as f:
                _calendar = json.load(f)
            _calendar_by_date = {d["date"]: d for d in _calendar if "date" in d}
            print(f"[DataStore] Loaded {len(_calendar)} calendar days from {cal_file}")
        except Exception as e:
            print(f"[DataStore] Calendar read error: {e}")
    else:
        print(f"[DataStore] Calendar file not found at {cal_file}")

    # 2. Monthly baseline
    base_file = BASE / "india_monthly_baseline.json"
    if base_file.exists():
        try:
            with open(base_file, encoding="utf-8") as f:
                _monthly_baseline = json.load(f)
        except Exception as e:
            print(f"[DataStore] Baseline read error: {e}")

    # 3. Grid hotspots
    grid_file = BASE / "india_grid_top_hotspots.json"
    if grid_file.exists():
        try:
            with open(grid_file, encoding="utf-8") as f:
                _grid = json.load(f)
            print(f"[DataStore] Loaded {len(_grid)} grid cells")
        except Exception as e:
            print(f"[DataStore] Grid read error: {e}")

    # 4. Metadata
    meta_file = BASE / "metadata.json"
    if meta_file.exists():
        try:
            with open(meta_file, encoding="utf-8") as f:
                _metadata = json.load(f)
        except Exception as e:
            print(f"[DataStore] Metadata read error: {e}")

    # 5. Forecast
    fc_path = BASE / "forecast_7day.json"
    if fc_path.exists():
        try:
            with open(fc_path, encoding="utf-8") as f:
                _forecast = json.load(f)
        except Exception as e:
            print(f"[DataStore] Forecast read error: {e}")

    # 6. Evaluation
    ev_path = MODELS / "evaluation_report.json"
    if ev_path.exists():
        try:
            with open(ev_path, encoding="utf-8") as f:
                _evaluation = json.load(f)
        except Exception as e:
            print(f"[DataStore] Evaluation read error: {e}")

    _loaded = True

# Load immediately on module load so serverless functions never have empty state
load_all()


def get_calendar_range(start: str, end: str) -> list[dict]:
    if not _calendar:
        load_all()
    return [d for d in _calendar if start <= d.get("date", "") <= end]


def get_day(date: str) -> dict | None:
    if not _calendar_by_date:
        load_all()
    return _calendar_by_date.get(date)


def get_all_days() -> list[dict]:
    if not _calendar:
        load_all()
    return _calendar


def get_grid() -> list[dict]:
    if not _grid:
        load_all()
    return _grid


def get_baseline() -> dict:
    if not _monthly_baseline:
        load_all()
    return _monthly_baseline


def get_metadata() -> dict:
    if not _metadata:
        load_all()
    return _metadata


def get_forecast() -> dict:
    global _forecast
    if not _forecast:
        fc_path = BASE / "forecast_7day.json"
        if fc_path.exists():
            try:
                with open(fc_path, encoding="utf-8") as f:
                    _forecast = json.load(f)
            except Exception as e:
                print(f"[DataStore] Read forecast error: {e}")
    return _forecast


def get_evaluation() -> dict:
    global _evaluation
    if not _evaluation:
        ev_path = MODELS / "evaluation_report.json"
        if ev_path.exists():
            try:
                with open(ev_path, encoding="utf-8") as f:
                    _evaluation = json.load(f)
            except Exception as e:
                print(f"[DataStore] Read evaluation error: {e}")
    return _evaluation


def get_hotspots_from_db(date: str) -> list[dict]:
    """Return individual hotspots if sqlite is present, otherwise fallback to empty."""
    db_path = BASE / "fire_events.db"
    if not db_path.exists():
        return []
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(
            "SELECT latitude, longitude, acq_time, satellite, confidence, frp, brightness, daynight "
            "FROM daily_hotspots WHERE acq_date = ? ORDER BY frp DESC LIMIT 100",
            (date,),
        )
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        print(f"[DataStore] SQLite error: {e}")
        return []
