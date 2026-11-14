import React, { useEffect, useRef, useState, useMemo } from 'react';
import { fetchGrid } from '../api';
import { GridCell } from '../types';
import L from 'leaflet';
import { MapPin, Flame, Navigation, ZoomIn, ZoomOut, Layers, ShieldCheck } from 'lucide-react';

export const GeospatialMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [cells, setCells] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [minEnergyFilter, setMinEnergyFilter] = useState<number>(0);
  const [activeCorridor, setActiveCorridor] = useState<string>('all');

  // Load 0.1° grid cells across Asia
  useEffect(() => {
    setLoading(true);
    fetchGrid('asia', 2000)
      .then((res) => {
        setCells(res.cells || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load spatial grid:', err);
        // Fallback to india route if needed
        fetchGrid('india', 2000)
          .then((res) => {
            setCells(res.cells || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  // Initialize Map Once with Strict-Mode Safety
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any stale leaflet ID to prevent "Map container is already initialized"
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.0, 80.0],
        zoom: 4,
        minZoom: 3,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark theme CartoDB basemap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      // Create LayerGroup for dynamic cell updates
      const lg = L.layerGroup().addTo(map);
      layerGroupRef.current = lg;
      mapInstanceRef.current = map;

      // Force recalculation of container dimensions
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Filtered cells based on user energy slider
  const filteredCells = useMemo(() => {
    if (minEnergyFilter === 0) return cells;
    return cells.filter((c) => c.frp_sum >= minEnergyFilter);
  }, [cells, minEnergyFilter]);

  // Update Markers when cells change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg) return;

    // Clear old markers
    lg.clearLayers();

    if (filteredCells.length === 0) return;

    filteredCells.forEach((c) => {
      // Scale radius by detection count (min 3.5px, max 14px)
      const radius = Math.min(14, Math.max(3.5, Math.sqrt(c.count) * 0.08));

      // Color coding by FRP cumulative thermal energy
      let color = '#38bdf8'; // Moderate
      if (c.frp_sum > 50000) {
        color = '#ef4444'; // Extreme cluster
      } else if (c.frp_sum > 15000) {
        color = '#f97316'; // High
      } else if (c.frp_sum > 5000) {
        color = '#eab308'; // Elevated
      }

      const marker = L.circleMarker([c.lat, c.lon], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 0.5,
        opacity: 0.85,
        fillOpacity: 0.75,
      });

      marker.on('click', () => {
        setSelectedCell(c);
      });

      marker.bindPopup(`
        <div style="font-family: -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 6px; min-width: 180px;">
          <div style="font-weight: 700; color: #ea580c; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
            0.1° × 0.1° Hotspot Cell (~11 km)
          </div>
          <div><strong>Coordinates:</strong> ${c.lat.toFixed(2)}°N, ${c.lon.toFixed(2)}°E</div>
          <div><strong>Total Fires:</strong> ${c.count.toLocaleString()} detections</div>
          <div><strong>Radiative Power:</strong> ${Math.round(c.frp_sum).toLocaleString()} MW</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">NASA Multi-Sensor Harmonized Record</div>
        </div>
      `);

      lg.addLayer(marker);
    });

    // Invalidate size to ensure rendering
    map.invalidateSize();
  }, [filteredCells]);

  // Corridor Navigation Presets
  const panToCorridor = (name: string, lat: number, lon: number, zoom: number) => {
    setActiveCorridor(name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20 font-mono">
                <MapPin className="h-3.5 w-3.5" />
                PAN-ASIAN SPATIAL HARMONIZATION
              </span>
              <span className="text-xs text-slate-400">
                • 0.1° × 0.1° WGS-84 (~11 km) Unified Grid
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Active Fire Hotspot Spatial Grid
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl">
              Mapping cumulative thermal detections and integrated Fire Radiative Power (FRP) across India, Pakistan,
              China, Malaysia, and surrounding transboundary corridors. Click any cell to inspect local fire density.
            </p>
          </div>

          {/* Preset Corridor Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-orange-400" />
              Focus Corridor:
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => panToCorridor('all', 25.0, 80.0, 4)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'all'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Asia
              </button>
              <button
                onClick={() => panToCorridor('punjab', 30.5, 75.8, 7)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'punjab'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Indo-Gangetic
              </button>
              <button
                onClick={() => panToCorridor('central', 22.8, 81.5, 6)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'central'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Central Forest
              </button>
              <button
                onClick={() => panToCorridor('china', 31.5, 110.0, 5)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'china'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                China Basin
              </button>
              <button
                onClick={() => panToCorridor('malaysia', 3.5, 102.5, 6)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'malaysia'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Malaysia
              </button>
              <button
                onClick={() => panToCorridor('iran', 28.5, 56.5, 6)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeCorridor === 'iran'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                E. Iran / Gulf
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Active Grid Cells</span>
            <p className="text-lg font-bold text-white mt-0.5">{cells.length.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Visible on Map</span>
            <p className="text-lg font-bold text-orange-400 mt-0.5">{filteredCells.length.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Spatial Resolution</span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">0.1° (~11 km)</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Sensors Integrated</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Tri-Sensor (M+J1+J2)
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl">
        {loading && (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <Flame className="h-10 w-10 text-orange-500 animate-bounce mb-3" />
            <p className="text-sm font-mono text-slate-300">Rendering 2,500 Pan-Asian Spatial Grid Cells...</p>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="h-[650px] w-full z-0 cursor-crosshair"
          style={{ background: '#070b14' }}
        />

        {/* Floating Custom Zoom Controls */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-950/90 p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Cell Detail Card */}
        {selectedCell && (
          <div className="absolute top-4 right-4 z-[400] w-80 rounded-2xl border border-orange-500/40 bg-slate-950/95 p-4 shadow-2xl shadow-orange-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                Cell Analysis (0.1° × 0.1°)
              </span>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Centroid:</span>
                <span className="text-white font-bold">{selectedCell.lat.toFixed(2)}°N, {selectedCell.lon.toFixed(2)}°E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Cumulative Detections:</span>
                <span className="text-orange-400 font-bold">{selectedCell.count.toLocaleString()} fires</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Total Radiative Energy:</span>
                <span className="text-amber-400 font-bold">{Math.round(selectedCell.frp_sum).toLocaleString()} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Mean FRP / Fire:</span>
                <span className="text-cyan-400 font-bold">
                  {(selectedCell.frp_sum / Math.max(1, selectedCell.count)).toFixed(1)} MW
                </span>
              </div>
              <div className="flex justify-between pt-1 text-[11px]">
                <span className="text-slate-500">Spatial Framework:</span>
                <span className="text-slate-400">WGS-84 (~11 km²)</span>
              </div>
            </div>
          </div>
        )}

        {/* Thermal Energy Legend */}
        <div className="absolute bottom-4 left-4 z-[400] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 mb-2 font-semibold text-slate-200">
            <Layers className="h-3.5 w-3.5 text-orange-400" />
            <span>Cumulative Radiative Energy (MW):</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-sky-400" /> &lt;5k MW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-yellow-400" /> 5k–15k MW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-orange-500" /> 15k–50k MW
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-500/40" /> &gt;50k MW (Intense Cluster)
            </span>
          </div>
        </div>

        {/* Filter Slider Pill in Bottom Right */}
        <div className="absolute bottom-4 right-4 z-[400] rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">Filter Min FRP:</span>
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={minEnergyFilter}
              onChange={(e) => setMinEnergyFilter(Number(e.target.value))}
              className="accent-orange-500 h-1.5 w-24 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-orange-400 font-bold min-w-[50px] text-right">
              {minEnergyFilter === 0 ? 'All' : `>${(minEnergyFilter / 1000).toFixed(0)}k MW`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
