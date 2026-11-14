import React, { useEffect, useRef, useState } from 'react';
import { fetchGrid } from '../api';
import { GridCell } from '../types';
import L from 'leaflet';
import { MapPin, Flame, Navigation } from 'lucide-react';

export const GeospatialMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);

  useEffect(() => {
    fetchGrid('india', 1500)
      .then((res) => {
        setCells(res.cells || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([22.5, 79.5], 5);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    if (cells.length > 0) {
      cells.forEach((c) => {
        const radius = Math.min(16, Math.max(4, Math.sqrt(c.count) * 0.12));
        const color = c.frp_sum > 20000 ? '#ef4444' : c.frp_sum > 5000 ? '#f97316' : '#eab308';

        const circle = L.circleMarker([c.lat, c.lon], {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 0.5,
          opacity: 0.8,
          fillOpacity: 0.7,
        }).addTo(map);

        circle.on('click', () => {
          setSelectedCell(c);
        });

        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong>0.1° × 0.1° Grid Cell (~11 km)</strong><br/>
            <strong>Center:</strong> ${c.lat.toFixed(2)}°N, ${c.lon.toFixed(2)}°E<br/>
            <strong>Total Detections:</strong> ${c.count.toLocaleString()} fires<br/>
            <strong>Radiative Power:</strong> ${c.frp_sum.toLocaleString()} MW
          </div>
        `);
      });
    }
  }, [cells]);

  const panTo = (lat: number, lon: number, zoom = 7) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], zoom);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <MapPin className="h-3.5 w-3.5" />
                MODULE 1 — GEOSPATIAL INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              0.1° Spatial Grid & Hotspot Clusters
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              1,500 active 0.1° × 0.1° (~11 km) analytical grid cells across India, mapping regional fire density and radiative energy.
            </p>
          </div>

          {/* Quick Focus Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Focus Corridor:
            </span>
            <button
              onClick={() => panTo(30.4, 75.8, 7)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              Punjab Residue
            </button>
            <button
              onClick={() => panTo(22.8, 81.2, 7)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              Central Forest
            </button>
            <button
              onClick={() => panTo(25.5, 93.0, 7)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              NE Shifting
            </button>
            <button
              onClick={() => panTo(22.5, 79.5, 5)}
              className="rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 text-xs font-medium"
            >
              All India
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div ref={mapContainerRef} className="h-[600px] w-full" />

        {/* Selected Cell Overlay */}
        {selectedCell && (
          <div className="absolute top-4 right-4 z-[400] w-72 rounded-xl border border-slate-700 bg-slate-950/90 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Selected Grid Cell
              </span>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Center:</span>
                <span className="text-white font-bold">{selectedCell.lat}°N, {selectedCell.lon}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Fires:</span>
                <span className="text-orange-400 font-bold">{selectedCell.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total FRP:</span>
                <span className="text-amber-400 font-bold">{selectedCell.frp_sum.toLocaleString()} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cell Dimensions:</span>
                <span className="text-cyan-400">0.1° × 0.1° (~11 km)</span>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[400] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 shadow-xl backdrop-blur-md text-xs">
          <span className="font-semibold text-slate-300 block mb-1">Grid Cell Radiative Energy:</span>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-yellow-400" /> &lt;5k MW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-orange-500" /> 5k–20k MW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" /> &gt;20k MW (Intense Cluster)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
