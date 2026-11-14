"""
FIRECHRONOS - In-memory data store.
Loads the pre-computed JSON files once at startup so all API
requests are served in microseconds with no CSV parsing overhead.
"""

import json
import sqlite3
from pathlib import Path

BASE    = Path(__file__).resolve().parent.parent / "data" / "processed"
MODELS  = Path(__file__).resolve().parent.parent / "models"

_calendar: list[dict] = []
_calendar_by_date: dict[str, dict] = {}
_monthly_baseline: dict[str, dict] = {}
_grid: list[dict] = []
_metadata: dict = {}
_forecast: dict = {}
_evaluation: dict = {}


def load_all():
    global _calendar, _calendar_by_date, _monthly_baseline, _grid, _metadata
    global _forecast, _evaluation

    with open(BASE / "india_daily_calendar.json", encoding="utf-8") as f:
        _calendar = json.load(f)
    _calendar_by_date = {d["date"]: d for d in _calendar}

    with open(BASE / "india_monthly_baseline.json", encoding="utf-8") as f:
        _monthly_baseline = json.load(f)

    with open(BASE / "india_grid_top_hotspots.json", encoding="utf-8") as f:
        _grid = json.load(f)

    with open(BASE / "metadata.json", encoding="utf-8") as f:
        _metadata = json.load(f)

    # Phase 4: forecast & evaluation (optional -- may not exist on first boot)
    fc_path = BASE / "forecast_7day.json"
    if fc_path.exists():
        with open(fc_path, encoding="utf-8") as f:
            _forecast = json.load(f)
        print(f"[DataStore] Loaded forecast: {len(_forecast.get('forecasts', []))} days")
    else:
        _forecast = {}
        print("[DataStore] No forecast file found -- run scripts/forecast.py to generate")

    ev_path = MODELS / "evaluation_report.json"
    if ev_path.exists():
        with open(ev_path, encoding="utf-8") as f:
            _evaluation = json.load(f)
        print(f"[DataStore] Loaded evaluation report")
    else:
        _evaluation = {}
        print("[DataStore] No evaluation report found -- run scripts/train_model.py to generate")

    print(f"[DataStore] Loaded {len(_calendar)} calendar days, {len(_grid)} grid cells")


def get_calendar_range(start: str, end: str) -> list[dict]:
    return [d for d in _calendar if start <= d["date"] <= end]


def get_day(date: str) -> dict | None:
    return _calendar_by_date.get(date)


def get_all_days() -> list[dict]:
    return _calendar


def get_grid() -> list[dict]:
    return _grid


def get_baseline() -> dict:
    return _monthly_baseline


def get_metadata() -> dict:
    return _metadata


def get_forecast() -> dict:
    global _forecast
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
    ev_path = MODELS / "evaluation_report.json"
    if ev_path.exists():
        try:
            with open(ev_path, encoding="utf-8") as f:
                _evaluation = json.load(f)
        except Exception as e:
            print(f"[DataStore] Read evaluation error: {e}")
    return _evaluation


def get_hotspots_from_db(date: str) -> list[dict]:
    """Return high-FRP individual hotspots from SQLite for a specific day."""
    db_path = BASE / "fire_events.db"
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
