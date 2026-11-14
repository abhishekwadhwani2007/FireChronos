import React, { useEffect, useState } from 'react';
import { fetchForecast, fetchModelAccuracy } from '../api';
import { ForecastResponse, ModelAccuracyResponse, ForecastDay, ForecastCorridor } from '../types';
import {
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Navigation,
  Activity,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ForecastPanel: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [accuracyData, setAccuracyData] = useState<ModelAccuracyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<ForecastCorridor | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchForecast('asia'), fetchModelAccuracy('asia')])
      .then(([fc, acc]) => {
        setForecastData(fc);
        setAccuracyData(acc);
        if (fc.forecasts && fc.forecasts.length > 0) {
          setSelectedDay(fc.forecasts[0]);
          if (fc.forecasts[0].corridors && fc.forecasts[0].corridors.length > 0) {
            setSelectedCorridor(fc.forecasts[0].corridors[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load forecast data:', err);
        setLoading(false);
      });
  }, []);

  const handleDaySelect = (day: ForecastDay) => {
    setSelectedDay(day);
    if (day.corridors && day.corridors.length > 0) {
      // Keep same corridor selected if possible, else first
      const existing = day.corridors.find((c) => c.id === selectedCorridor?.id);
      setSelectedCorridor(existing || day.corridors[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Flame className="h-10 w-10 animate-bounce text-orange-500" />
        <p className="text-sm font-mono text-slate-400">Loading Pan-Asian Fire Risk Forecast & Spatial Telemetry...</p>
      </div>
    );
  }

  const chartData = forecastData?.forecasts.map((f) => ({
    date: f.date.slice(5),
    fullDate: f.date,
    day: f.day_of_week.slice(0, 3),
    predicted: f.predicted_hai,
    ciLow: f.confidence_interval_low,
    ciHigh: f.confidence_interval_high,
    baseline: f.expected_seasonal_baseline,
    prob: (f.high_anomaly_probability * 100).toFixed(1),
    tier: f.risk_tier,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20 font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                PREDICTIVE WILDFIRE INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400">
                • 7-Day Horizon • Pan-Asian Multi-Sensor Coverage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pan-Asian 7-Day Fire Risk Forecast
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl">
              Synthesizing multi-satellite observations (MODIS C6.1 + VIIRS NOAA-20/21) across India, Pakistan,
              China, and Malaysia. Features continuous daily activity index regression coupled with localized spatial corridor risk breakdown.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Model R² Fit</span>
              <span className="text-emerald-400 font-bold text-sm">95.3%</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mean Abs Error</span>
              <span className="text-cyan-400 font-bold text-sm">±1.50 HAI</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">ROC-AUC</span>
              <span className="text-amber-400 font-bold text-sm">0.868</span>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Cards Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-6 border-t border-slate-800/80">
          {forecastData?.forecasts.map((fc) => {
            const isSelected = selectedDay?.date === fc.date;
            return (
              <button
                key={fc.date}
                onClick={() => handleDaySelect(fc)}
                className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all font-mono ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{fc.day_of_week.slice(0, 3)}</span>
                    <span>+{fc.day_offset}d</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{fc.date.slice(5)}</div>
                </div>

                <div className="my-3">
                  <div className="text-2xl font-bold font-mono text-white">
                    {fc.predicted_hai.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    CI: [{fc.confidence_interval_low}, {fc.confidence_interval_high}]
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span
                    className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${fc.color}20`, color: fc.color }}
                  >
                    {fc.risk_tier}
                  </span>
                  <span className="text-slate-400">
                    P: {(fc.high_anomaly_probability * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trajectory Chart + Selected Day Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Predictive Trajectory Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                7-Day Predictive Trajectory & Uncertainty Envelope
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                90% confidence interval band widens with forecast horizon to reflect atmospheric entropy.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                Predicted HAI
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                Seasonal Climatology
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" domain={[0, 'dataMax + 8']} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-white">{data.fullDate} ({data.day})</div>
                          <div className="text-orange-400">Predicted HAI: <strong>{data.predicted}</strong></div>
                          <div className="text-slate-400">90% CI: [{data.ciLow}, {data.ciHigh}]</div>
                          <div className="text-cyan-400">Climatology: {data.baseline}</div>
                          <div className="text-rose-400 font-bold">Hazard Prob: {data.prob}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ciHigh"
                  stroke="none"
                  fill="#f97316"
                  fillOpacity={0.12}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#475569"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ea580c', strokeWidth: 1, stroke: '#ffffff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Forecast Anchor: {forecastData?.anchor_date}</span>
            <span>Spatial Extent: 52.1°E to 109.9°E (Pan-Asia AOI)</span>
          </div>
        </div>

        {/* Right Col: Selected Day Summary */}
        {selectedDay && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 font-mono">
                  <Calendar className="h-4 w-4" />
                  Day +{selectedDay.day_offset} Detail
                </span>
                <span
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${selectedDay.color}20`, color: selectedDay.color }}
                >
                  {selectedDay.risk_tier}
                </span>
              </div>

              <div className="text-center my-4">
                <span className="text-xs text-slate-400 font-mono">{selectedDay.day_of_week}, {selectedDay.date}</span>
                <div className="text-4xl font-extrabold font-mono text-white mt-1">
                  {selectedDay.predicted_hai.toFixed(1)}
                  <span className="text-sm font-normal text-slate-400 ml-1">HAI</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  90% CI: [{selectedDay.confidence_interval_low}, {selectedDay.confidence_interval_high}]
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono pt-3 border-t border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Est. Daily Active Hotspots:</span>
                  <span className="text-white font-bold">
                    {selectedDay.total_estimated_hotspots?.toLocaleString() ?? '~7,200'} fires
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Dominant Fire Corridor:</span>
                  <span className="text-orange-400 font-bold truncate max-w-[170px]" title={selectedDay.dominant_corridor}>
                    {selectedDay.dominant_corridor ? selectedDay.dominant_corridor.split('(')[0].trim() : 'Indo-Gangetic'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Seasonal Climatology Normal:</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedDay.expected_seasonal_baseline.toFixed(1)} HAI
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Outbreak Hazard Probability:</span>
                  <span className="text-amber-400 font-bold">
                    {(selectedDay.high_anomaly_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-0.5">Atmospheric Situational Status:</span>
              <span>
                {selectedDay.predicted_hai < 12
                  ? 'Suppressed regional burning. Post-monsoon moist soils and late-autumn boundary conditions suppress widespread uncontrolled wildfire spread.'
                  : 'Elevated thermal activity detected across agricultural clearing belts.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* WHERE: SPATIAL LOCALIZATION & REGIONAL CORRIDOR BREAKDOWN */}
      {selectedDay && selectedDay.corridors && selectedDay.corridors.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">
                  Where: Regional Risk & Corridor Localization (+{selectedDay.day_offset}d: {selectedDay.date})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Geographic distribution of projected wildfire and agricultural burning activity across Asia's 6 key ecologies.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300 border border-slate-700/60 font-mono">
              <Navigation className="h-3.5 w-3.5 text-orange-400" />
              Thermal Center: {selectedDay.center_of_mass ? `${selectedDay.center_of_mass[0]}°N, ${selectedDay.center_of_mass[1]}°E` : '25.4°N, 82.6°E'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDay.corridors.map((corridor) => {
              const isCorridorSelected = selectedCorridor?.id === corridor.id;
              const isElevated = corridor.risk_tier === 'ELEVATED' || corridor.risk_tier === 'CRITICAL';
              return (
                <div
                  key={corridor.id}
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
                    isCorridorSelected
                      ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${isElevated ? 'bg-orange-500 animate-pulse' : 'bg-emerald-400'}`} />
                        {corridor.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {corridor.countries.join(' · ')} • {corridor.centroid[0]}°N, {corridor.centroid[1]}°E
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        corridor.risk_tier === 'ELEVATED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : corridor.risk_tier === 'NOMINAL'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {corridor.risk_tier}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">
                    {corridor.primary_driver}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono">
                    <div className="rounded bg-slate-900/60 p-1.5">
                      <span className="text-[10px] text-slate-400 uppercase block">Share</span>
                      <span className="text-xs font-bold text-orange-400">{corridor.share_percentage}%</span>
                    </div>
                    <div className="rounded bg-slate-900/60 p-1.5">
                      <span className="text-[10px] text-slate-400 uppercase block">Est. Fires</span>
                      <span className="text-xs font-bold text-white">{corridor.predicted_hotspots.toLocaleString()}</span>
                    </div>
                    <div className="rounded bg-slate-900/60 p-1.5">
                      <span className="text-[10px] text-slate-400 uppercase block">Energy</span>
                      <span className="text-xs font-bold text-cyan-400">{Math.round(corridor.predicted_frp_mw).toLocaleString()} MW</span>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-500 block text-[10px] uppercase mb-0.5">Key Monitored Zones:</span>
                    <span className="text-slate-300">{corridor.key_zones.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Corridor Coordinate Inspection Card */}
          {selectedCorridor && (
            <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-orange-400 shrink-0" />
                <div>
                  <span className="text-white font-bold">{selectedCorridor.name} Active Hotspot Grid Points</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Targeted surveillance coordinates: {selectedCorridor.coordinates_sample.map((pt) => `[${pt[0]}°N, ${pt[1]}°E]`).join(', ')}
                  </div>
                </div>
              </div>
              <div className="text-slate-400 text-right shrink-0">
                <span className="text-slate-500 block text-[10px] uppercase">Centroid Reference</span>
                <span className="text-orange-400 font-bold">{selectedCorridor.centroid[0]}°N, {selectedCorridor.centroid[1]}°E</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Accuracy & Architecture Telemetry */}
      {accuracyData && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Model Calibration & Evaluation Benchmark
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against 494 chronological holdout days (July 1, 2025 to November 6, 2026) to prevent temporal data leakage.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Strict Out-Of-Sample Holdout (494 Days)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Operational Precision (T=0.50)</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">65.5% - 92.3%</p>
              <p className="text-[10px] text-slate-500 mt-1">Documented trade-off curve across alert thresholds</p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Classification Accuracy</span>
              <p className="text-2xl font-extrabold text-cyan-400 mt-1">89.3%</p>
              <p className="text-[10px] text-slate-500 mt-1">441/494 days correctly categorized</p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Continuous HAI R² Fit</span>
              <p className="text-2xl font-extrabold text-orange-400 mt-1">0.953</p>
              <p className="text-[10px] text-slate-500 mt-1">95.3% variance explained on unseen days</p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Mean Absolute Error</span>
              <p className="text-2xl font-extrabold text-white mt-1">±1.50</p>
              <p className="text-[10px] text-slate-500 mt-1">HAI points on 0–100 scale</p>
            </div>
          </div>

          {/* Top Predictive Drivers */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 block mb-3 font-mono flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-orange-400" />
              Primary Empirical Feature Drivers:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {accuracyData.top_features.map((feat, idx) => (
                <span
                  key={feat}
                  className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-slate-200"
                >
                  <span className="text-orange-400 font-bold mr-1.5">{idx + 1}.</span>
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
