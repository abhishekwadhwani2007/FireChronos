import React, { useState, useEffect } from 'react';
import { fetchSeasonalProfile, fetchAnomalies } from '../api';
import { SeasonalProfileResponse } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area
} from 'recharts';
import { BarChart3, AlertTriangle, Calendar, Flame, CloudRain, Sun, Trees } from 'lucide-react';

interface HistoricalTrendsProps {
  onSelectDate: (date: string) => void;
}

export const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ onSelectDate }) => {
  const [profileData, setProfileData] = useState<SeasonalProfileResponse | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchSeasonalProfile('india'),
      fetchAnomalies('india', 'HIGH', 15),
    ])
      .then(([prof, anom]) => {
        setProfileData(prof);
        setAnomalies(anom.anomalies || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const monthlyChartData = React.useMemo(() => {
    if (!profileData?.profile) return [];
    return profileData.profile.map((p) => ({
      month: p.month_name,
      mean_daily: p.baseline_mean_daily,
      std_high: Math.round(p.baseline_mean_daily + p.baseline_std_daily),
      std_low: Math.max(0, Math.round(p.baseline_mean_daily - p.baseline_std_daily)),
    }));
  }, [profileData]);

  const annualTotals = React.useMemo(() => {
    if (!profileData?.profile) return [];
    const totals: Record<number, number> = {};
    profileData.profile.forEach((p) => {
      p.yearly_data.forEach((y) => {
        totals[y.year] = (totals[y.year] || 0) + y.total_count;
      });
    });
    return Object.entries(totals).map(([yr, count]) => ({
      year: yr,
      count: count,
    }));
  }, [profileData]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <BarChart3 className="h-8 w-8 animate-bounce text-orange-500" />
        <p className="text-sm text-slate-400">Loading multi-year climatological profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20">
            <BarChart3 className="h-3.5 w-3.5" />
            MODULE 4 — HISTORICAL FIRE INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Seasonal Cycles & Multi-Year Anomaly Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-2xl">
          Multi-year historical baselines (2020–2026) revealing India's dual fire peaks, monsoon quenching, and statistical outliers.
        </p>
      </div>

      {/* Fire Regimes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase">
            <span>Spring Peak (Peak 1)</span>
            <Trees className="h-4 w-4" />
          </div>
          <p className="mt-1 text-sm font-semibold text-white">March – April</p>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Central & North-East India deciduous forest fires and shifting agricultural burning (~5,000 fires/day).
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase">
            <span>Monsoon Lull (Quenched)</span>
            <CloudRain className="h-4 w-4" />
          </div>
          <p className="mt-1 text-sm font-semibold text-white">July – August</p>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Heavy rainfall and pervasive cloud cover drastically suppress open biomass burning (&lt;90 fires/day).
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase">
            <span>Post-Monsoon (Peak 2)</span>
            <Sun className="h-4 w-4" />
          </div>
          <p className="mt-1 text-sm font-semibold text-white">October – November</p>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Intense paddy residue / stubble burning in Punjab and Haryana preparing fields for wheat sowing (~2,400 fires/day).
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Winter Transition</span>
            <Calendar className="h-4 w-4" />
          </div>
          <p className="mt-1 text-sm font-semibold text-white">December – February</p>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Moderate biomass burning and agricultural land preparation across southern and central states (~1,400 fires/day).
          </p>
        </div>
      </div>

      {/* Climatological Monthly Profile Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              12-Month Climatological Fire Activity Profile (Daily Mean ± 1σ)
            </h3>
            <p className="text-xs text-slate-400">
              The historical normal baseline used by the Harmonization Engine to compute anomaly Z-scores.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey="std_high"
                name="Normal Range Upper (μ + σ)"
                stroke="transparent"
                fill="#f97316"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="mean_daily"
                name="Historical Mean Daily Detections"
                stroke="#f97316"
                strokeWidth={3}
                fill="#f97316"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annual Totals Bar Chart + Top Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            Total Annual Recorded Detections (2020–2026)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated authentic NASA VIIRS observations per calendar year.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualTotals} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" name="Total Fires" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Critical Historical Anomalies Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Top Critical Historical Fire Anomalies
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Highest statistical outlier days ($Z \ge 2.0$) relative to their calendar month baselines. Click to inspect!
          </p>

          <div className="overflow-y-auto max-h-60 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Detections</th>
                  <th className="px-3 py-2">Z-Score</th>
                  <th className="px-3 py-2">HAI</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/80 text-slate-300">
                {anomalies.map((anom) => (
                  <tr key={anom.date} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-3 py-2 text-white font-bold">{anom.date}</td>
                    <td className="px-3 py-2 text-orange-400">{anom.viirs_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-rose-400 font-bold">+{anom.anomaly_score}</td>
                    <td className="px-3 py-2 font-bold text-emerald-400">{anom.hai}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onSelectDate(anom.date)}
                        className="rounded bg-slate-800 px-2 py-1 text-[10px] text-cyan-400 hover:bg-slate-700 transition-all font-sans font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
