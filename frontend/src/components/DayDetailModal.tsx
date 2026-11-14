import React, { useEffect, useRef } from 'react';
import { DayDetail } from '../types';
import { X, Flame, Satellite, Compass, Activity, ShieldCheck, MapPin } from 'lucide-react';
import L from 'leaflet';

interface DayDetailModalProps {
  dayDetail: DayDetail | null;
  loading: boolean;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ dayDetail, loading, onClose }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!dayDetail || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([22.5, 80.0], 5);

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Zero-Key Esri Dark Canvas (Clean, no API key watermark)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16, attribution: 'Tiles © Esri' }
    ).addTo(map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16, pane: 'overlayPane' }
    ).addTo(map);

    if (dayDetail.top_hotspots && dayDetail.top_hotspots.length > 0) {
      const markers: L.CircleMarker[] = [];
      dayDetail.top_hotspots.forEach((spot) => {
        const radius = Math.min(18, Math.max(5, Math.sqrt(spot.frp) * 1.5));
        const circle = L.circleMarker([spot.latitude, spot.longitude], {
          radius: radius,
          fillColor: spot.frp > 50 ? '#ef4444' : '#f97316',
          color: '#ffffff',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong>NASA Hotspot Observation</strong><br/>
            <strong>Coord:</strong> ${spot.latitude.toFixed(4)}°, ${spot.longitude.toFixed(4)}°<br/>
            <strong>FRP:</strong> ${spot.frp.toFixed(1)} MW<br/>
            <strong>Confidence:</strong> ${spot.confidence.toUpperCase()}<br/>
            <strong>Time (UTC):</strong> ${spot.acq_time} | ${spot.daynight === 'D' ? 'Day' : 'Night'}
          </div>
        `);
        markers.push(circle);
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.3));
      }
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [dayDetail]);

  if (!dayDetail && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-white">
                  {dayDetail?.date || 'Loading...'}
                </h2>
                {dayDetail && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      dayDetail.harmonization.anomaly_code === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : dayDetail.harmonization.anomaly_code === 'ELEVATED'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {dayDetail.harmonization.anomaly_class} (Z: {dayDetail.harmonization.anomaly_score > 0 ? '+' : ''}
                    {dayDetail.harmonization.anomaly_score})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                NASA FIRMS Observation Deep-Dive & Multi-Sensor Breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading || !dayDetail ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3 p-8">
            <Flame className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-slate-400">Fetching authentic NASA observations for this day...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Cards: HAI + Sensor Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* HAI Metric Card */}
              <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-4">
                <div className="flex items-center justify-between text-xs text-orange-400 font-semibold uppercase">
                  <span>Harmonized Activity Index</span>
                  <Activity className="h-4 w-4" />
                </div>
                <p className="mt-2 text-3xl font-black text-white font-mono">
                  {dayDetail.harmonization.hai} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  Monthly Baseline Mean: <strong className="text-white font-mono">{dayDetail.harmonization.monthly_baseline?.mean_count ?? 'N/A'}</strong> fires/day
                </div>
              </div>

              {/* VIIRS NOAA-20 Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase">
                  <span>VIIRS NOAA-20 (375m)</span>
                  <Satellite className="h-4 w-4" />
                </div>
                <p className="mt-2 text-3xl font-bold text-white font-mono">
                  {dayDetail.sensors.viirs_n20.detection_count.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">hotspots</span>
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>FRP Sum: <strong className="text-amber-400 font-mono">{(dayDetail.sensors.viirs_n20.frp_sum_mw).toLocaleString()} MW</strong></span>
                  <span>Peak: <strong className="text-white font-mono">{dayDetail.sensors.viirs_n20.frp_max_mw} MW</strong></span>
                </div>
              </div>

              {/* Calibrated MODIS Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold uppercase">
                  <span>MODIS C6.1 Equivalent (1km)</span>
                  <Compass className="h-4 w-4" />
                </div>
                <p className="mt-2 text-3xl font-bold text-white font-mono">
                  {dayDetail.sensors.modis_calibrated.detection_count.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">est. fires</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  FRP Equiv: <strong className="text-cyan-400 font-mono">{dayDetail.sensors.modis_calibrated.frp_sum_mw.toLocaleString()} MW</strong> (Schroeder et al. 2014)
                </p>
              </div>
            </div>

            {/* Confidence & Observation Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-2.5">
                <span className="text-slate-400">High Confidence (h)</span>
                <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {dayDetail.sensors.viirs_n20.confidence_breakdown.high.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-2.5">
                <span className="text-slate-400">Nominal Confidence (n)</span>
                <p className="text-base font-bold text-blue-400 font-mono mt-0.5">
                  {dayDetail.sensors.viirs_n20.confidence_breakdown.nominal.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-2.5">
                <span className="text-slate-400">Day Passes</span>
                <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {dayDetail.sensors.viirs_n20.daynight_breakdown.day.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-2.5">
                <span className="text-slate-400">Night Passes</span>
                <p className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                  {dayDetail.sensors.viirs_n20.daynight_breakdown.night.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Interactive Leaflet Map showing authentic coordinates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Spatial Hotspot Distribution (Top Detected Coordinates)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {dayDetail.top_hotspots.length} high-intensity hotspots
                </span>
              </div>
              <div
                ref={mapContainerRef}
                className="h-64 w-full rounded-xl border border-slate-800 shadow-inner overflow-hidden"
              />
            </div>

            {/* Top Hotspots Table */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Raw NASA Hotspot Evidence Table
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Latitude</th>
                      <th className="px-3 py-2">Longitude</th>
                      <th className="px-3 py-2">Time (UTC)</th>
                      <th className="px-3 py-2">Satellite</th>
                      <th className="px-3 py-2">Confidence</th>
                      <th className="px-3 py-2">FRP (MW)</th>
                      <th className="px-3 py-2">Brightness (K)</th>
                      <th className="px-3 py-2">Day/Night</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/80 text-slate-300">
                    {dayDetail.top_hotspots.map((spot, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-3 py-2 text-white">{spot.latitude.toFixed(4)}°</td>
                        <td className="px-3 py-2 text-white">{spot.longitude.toFixed(4)}°</td>
                        <td className="px-3 py-2 text-slate-400">{spot.acq_time}</td>
                        <td className="px-3 py-2 text-cyan-400">{spot.satellite}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                              spot.confidence === 'h'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : spot.confidence === 'n'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {spot.confidence}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-bold text-orange-400">{spot.frp.toFixed(1)}</td>
                        <td className="px-3 py-2 text-slate-300">{spot.brightness.toFixed(1)}</td>
                        <td className="px-3 py-2">{spot.daynight === 'D' ? 'Day' : 'Night'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
