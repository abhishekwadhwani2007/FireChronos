import React, { useState, useMemo } from 'react';
import { DayRecord, CalendarResponse } from '../types';
import { Calendar as CalendarIcon, Flame, AlertTriangle, Filter, Sparkles, Info } from 'lucide-react';

interface CalendarViewProps {
  data: CalendarResponse | null;
  loading: boolean;
  mode: 'harmonized' | 'viirs' | 'modis';
  setMode: (mode: 'harmonized' | 'viirs' | 'modis') => void;
  selectedYear: number | 'all';
  setSelectedYear: (year: number | 'all') => void;
  onSelectDate: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  loading,
  mode,
  setMode,
  selectedYear,
  setSelectedYear,
  onSelectDate,
}) => {
  const [anomalyFilter, setAnomalyFilter] = useState<'ALL' | 'HIGH' | 'ELEVATED' | 'NORMAL' | 'LOW'>('ALL');
  const [hoveredDay, setHoveredDay] = useState<DayRecord | null>(null);

  const availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  // Filter days by year and anomaly
  const filteredDays = useMemo(() => {
    if (!data?.days) return [];
    return data.days.filter((d) => {
      const yearMatch = selectedYear === 'all' || d.year === selectedYear;
      const anomalyMatch = anomalyFilter === 'ALL' || d.anomaly_code === anomalyFilter;
      return yearMatch && anomalyMatch;
    });
  }, [data, selectedYear, anomalyFilter]);

  // Group days by Year -> Month for structured calendar display
  const structuredData = useMemo(() => {
    const yearsToShow = selectedYear === 'all' ? availableYears : [selectedYear];
    const map: Record<number, Record<number, DayRecord[]>> = {};

    yearsToShow.forEach((y) => {
      map[y] = {};
      for (let m = 1; m <= 12; m++) {
        map[y][m] = [];
      }
    });

    filteredDays.forEach((d) => {
      if (map[d.year] && map[d.year][d.month]) {
        map[d.year][d.month].push(d);
      }
    });

    return map;
  }, [filteredDays, selectedYear]);

  // Dynamic color coding based on mode
  const getCellColor = (day: DayRecord) => {
    if (mode === 'harmonized') {
      const val = day.hai;
      if (val >= 85) return 'bg-rose-500 text-white shadow-sm shadow-rose-500/50';
      if (val >= 70) return 'bg-orange-500 text-white';
      if (val >= 55) return 'bg-amber-500 text-slate-950';
      if (val >= 40) return 'bg-yellow-600/70 text-slate-100';
      if (val >= 25) return 'bg-teal-900/60 text-slate-300';
      return 'bg-slate-800/60 text-slate-400';
    } else {
      // Raw count scale
      const c = day.count;
      if (c >= 8000) return 'bg-rose-500 text-white shadow-sm shadow-rose-500/50';
      if (c >= 4000) return 'bg-orange-500 text-white';
      if (c >= 2000) return 'bg-amber-500 text-slate-950';
      if (c >= 800) return 'bg-amber-700/60 text-slate-200';
      if (c >= 200) return 'bg-slate-700 text-slate-300';
      return 'bg-slate-800/60 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Flame className="h-10 w-10 animate-bounce text-orange-500" />
        <p className="text-sm font-medium text-slate-400">Loading 2,503 Harmonized Calendar Days...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                CENTRAL PRODUCT EXPERIENCE
              </span>
              <span className="text-xs text-slate-400">• Click any day for NASA hotspot drilldown</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Harmonized Burning Activity Calendar
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Standardized temporal-spatial framework unifying MODIS C6.1 (1 km) and VIIRS (375 m) observations
              into a consistent, anomaly-aware burning history across India (2020–2026).
            </p>
          </div>

          {/* Sensor Mode Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-1.5 rounded-xl border border-slate-800 bg-slate-950/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
              View Mode:
            </span>
            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setMode('harmonized')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  mode === 'harmonized'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Harmonized Index (HAI)
              </button>
              <button
                onClick={() => setMode('viirs')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  mode === 'viirs'
                    ? 'bg-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                VIIRS NOAA-20 (375m)
              </button>
              <button
                onClick={() => setMode('modis')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  mode === 'modis'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MODIS Calibrated (1km)
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Summary Strip */}
        {data?.summary && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80">
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Days Analyzed</span>
              <p className="text-lg font-bold text-white font-mono mt-0.5">{filteredDays.length.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {mode === 'harmonized' ? 'VIIRS Detections' : mode === 'viirs' ? 'VIIRS 375m Count' : 'MODIS Calibrated'}
              </span>
              <p className="text-lg font-bold text-orange-400 font-mono mt-0.5">
                {filteredDays.reduce((acc, d) => acc + d.count, 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total FRP Energy</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                {(filteredDays.reduce((acc, d) => acc + d.frp_sum, 0) / 1000).toFixed(1)}k MW
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Peak Burning Day</span>
              <p className="text-lg font-bold text-rose-400 font-mono mt-0.5 truncate">{data.summary.peak_day}</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">High Anomaly Days</span>
              <p className="text-lg font-bold text-rose-500 font-mono mt-0.5 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                {filteredDays.filter((d) => d.anomaly_code === 'HIGH').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar: Years + Anomaly filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {/* Year Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            Year:
          </span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedYear === 'all'
                ? 'bg-orange-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All (2020–2026)
          </button>
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium font-mono transition-all ${
                selectedYear === y
                  ? 'bg-orange-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Anomaly Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Anomaly:
          </span>
          {(['ALL', 'HIGH', 'ELEVATED', 'NORMAL', 'LOW'] as const).map((anom) => (
            <button
              key={anom}
              onClick={() => setAnomalyFilter(anom)}
              className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                anomalyFilter === anom
                  ? anom === 'HIGH'
                    ? 'bg-rose-500 text-white font-bold'
                    : anom === 'ELEVATED'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {anom === 'ALL'
                ? 'All'
                : anom === 'HIGH'
                ? '🔥 High'
                : anom === 'ELEVATED'
                ? '⚡ Elevated'
                : anom === 'NORMAL'
                ? 'Normal'
                : 'Low'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid Representation */}
      <div className="space-y-8">
        {Object.entries(structuredData).map(([yearStr, monthsMap]) => {
          const year = parseInt(yearStr);
          return (
            <div key={year} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold font-mono text-white tracking-wide">{year}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {Object.values(monthsMap).reduce((a, b) => a + b.length, 0)} observation days
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    High Anomaly
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Elevated
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-700" />
                    Historical Normal
                  </span>
                </div>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const daysInMonth = monthsMap[m] || [];
                  const totalDetections = daysInMonth.reduce((a, b) => a + b.count, 0);

                  return (
                    <div
                      key={m}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-semibold text-slate-200">
                          {MONTH_NAMES[m - 1]}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {totalDetections > 0 ? `${totalDetections.toLocaleString()} fires` : 'No data'}
                        </span>
                      </div>

                      {/* Day cells (up to 31) */}
                      <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((d) => {
                          const isHigh = d.anomaly_code === 'HIGH';
                          const isElevated = d.anomaly_code === 'ELEVATED';

                          return (
                            <button
                              key={d.date}
                              onClick={() => onSelectDate(d.date)}
                              onMouseEnter={() => setHoveredDay(d)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className={`group relative flex h-7 w-full items-center justify-center rounded text-[11px] font-mono font-medium transition-transform hover:scale-110 focus:outline-none ${getCellColor(
                                d
                              )} ${isHigh ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-slate-950' : ''} ${
                                isElevated ? 'ring-1 ring-amber-400' : ''
                              }`}
                              title={`${d.date}: ${d.count} detections (HAI: ${d.hai}) - ${d.anomaly_class}`}
                            >
                              <span>{d.day}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Hover Tooltip Bar */}
      {hoveredDay && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-orange-500/40 bg-slate-950/95 px-5 py-3 shadow-2xl shadow-orange-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            <div>
              <span className="text-xs text-slate-400 font-mono">Date</span>
              <p className="text-sm font-bold text-white font-mono">{hoveredDay.date}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Harmonized Index</span>
            <p className="text-sm font-bold text-orange-400 font-mono">HAI {hoveredDay.hai}</p>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400">Detections (VIIRS / MODIS)</span>
            <p className="text-sm font-bold text-white font-mono">
              {hoveredDay.count.toLocaleString()} / {hoveredDay.modis_count?.toLocaleString() || '—'}
            </p>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400">Total FRP</span>
            <p className="text-sm font-bold text-amber-400 font-mono">
              {hoveredDay.frp_sum.toLocaleString()} MW
            </p>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400">Anomaly Classification</span>
            <p
              className={`text-sm font-bold ${
                hoveredDay.anomaly_code === 'HIGH'
                  ? 'text-rose-400'
                  : hoveredDay.anomaly_code === 'ELEVATED'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {hoveredDay.anomaly_class} (Z: {hoveredDay.anomaly_score > 0 ? '+' : ''}
              {hoveredDay.anomaly_score})
            </p>
          </div>
        </div>
      )}

      {/* Legend & Scientific Explainability Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Activity Scale (HAI):</span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="h-3 w-5 rounded bg-slate-800" /> &lt;25
              <span className="h-3 w-5 rounded bg-teal-900/60 ml-2" /> 25–40
              <span className="h-3 w-5 rounded bg-amber-500 ml-2" /> 40–70
              <span className="h-3 w-5 rounded bg-orange-500 ml-2" /> 70–85
              <span className="h-3 w-5 rounded bg-rose-500 ml-2" /> 85–100 (Peak Burning)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Baseline calculated against 2020–2025 climatological normal for each calendar month.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
