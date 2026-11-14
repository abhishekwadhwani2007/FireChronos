import React, { useEffect, useRef, useState, useMemo } from 'react';
import { fetchGrid } from '../api';
import { GridCell } from '../types';
import L from 'leaflet';
import {
  MapPin,
  Flame,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Globe
} from 'lucide-react';

type BaseMapStyle = 'dark' | 'osm' | 'satellite';

export const GeospatialMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [cells, setCells] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [minEnergyFilter, setMinEnergyFilter] = useState<number>(0);
  const [activeCorridor, setActiveCorridor] = useState<string>('all');
  const [baseMap, setBaseMap] = useState<BaseMapStyle>('dark');

  // Load 0.1° grid cells across Asia
  useEffect(() => {
    setLoading(true);
    fetchGrid('asia', 2000)
      .then((res) => {
        setCells(res.cells || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load spatial grid from asia, trying fallback:', err);
        fetchGrid('india', 1500)
          .then((res) => {
            setCells(res.cells || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  // Initialize Map with guaranteed lifecycle and resize robustness
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Fully reset container DOM to avoid StrictMode dual-mount clashes
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Leaflet cleanup exception:', e);
      }
      mapInstanceRef.current = null;
    }
    container.innerHTML = '';
    (container as any)._leaflet_id = null;

    // Initialize Leaflet map
    const map = L.map(container, {
      center: [25.0, 80.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    // Tile Layer creation based on active style
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let options: L.TileLayerOptions = { subdomains: 'abcd', maxZoom: 18, attribution: '© CartoDB' };

    if (baseMap === 'osm') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      options = { maxZoom: 18, attribution: '© OpenStreetMap contributors' };
    } else if (baseMap === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      options = { maxZoom: 17, attribution: 'Tiles © Esri' };
    }

    const tileLayer = L.tileLayer(tileUrl, options).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // LayerGroup for fire markers
    const lg = L.layerGroup().addTo(map);
    layerGroupRef.current = lg;
    mapInstanceRef.current = map;

    // Multiple layout passes to guarantee canvas rendering
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    // Dynamic resize observer
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        currentTileLayerRef.current = null;
      }
    };
  }, [baseMap]);

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

    lg.clearLayers();
    if (filteredCells.length === 0) return;

    filteredCells.forEach((c) => {
      // Scale radius by detection count (min 3.5px, max 13px)
      const radius = Math.min(13, Math.max(3.5, Math.sqrt(c.count) * 0.08));

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
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">NASA Harmonized Multi-Sensor</div>
        </div>
      `);

      lg.addLayer(marker);
    });

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
              Harmonized fire observation centroids across India, China, Pakistan, Eastern Iran, and Malaysia.
              Each grid cell aggregates fire radiative power (MW) and cumulative detections from MODIS C6.1 and VIIRS NOAA-20/21.
            </p>
          </div>

          {/* Controls: Basemap Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <Globe className="h-4 w-4 text-slate-400 ml-2" />
            <span className="text-slate-400 mr-1 text-[11px]">Basemap:</span>
            <button
              onClick={() => setBaseMap('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'dark' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => setBaseMap('osm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'osm' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              OpenStreetMap
            </button>
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'satellite' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Filter & Presets Row */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
          {/* Energy Slider */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono shrink-0">
              Min Radiative Energy:
            </span>
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={minEnergyFilter}
              onChange={(e) => setMinEnergyFilter(Number(e.target.value))}
              className="w-40 sm:w-56 accent-orange-500"
            />
            <span className="text-xs font-mono font-bold text-orange-400 min-w-[70px]">
              {minEnergyFilter === 0 ? 'All Cells' : `≥ ${minEnergyFilter.toLocaleString()} MW`}
            </span>
          </div>

          {/* Regional Corridor Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mr-1">
              <Navigation className="h-3.5 w-3.5 text-orange-400" />
              Focus:
            </span>
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
              onClick={() => panToCorridor('china', 28.5, 112.5, 5)}
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

        {/* Telemetry Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Visible Active Cells</span>
            <p className="text-lg font-bold text-orange-400 mt-0.5">{filteredCells.length.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">AOI Longitude Range</span>
            <p className="text-lg font-bold text-white mt-0.5">52.1°E — 109.9°E</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Spatial Discretization</span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">0.1° (~11 km)</p>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase">Constellations Combined</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              MODIS + VIIRS N20/N21
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl">
        {loading && (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <Flame className="h-10 w-10 text-orange-500 animate-bounce mb-3" />
            <p className="text-sm font-mono text-slate-300">Loading Pan-Asian Spatial Grid Cells...</p>
          </div>
        )}

        {/* Map Container with guaranteed styling */}
        <div
          ref={mapContainerRef}
          style={{
            height: '650px',
            minHeight: '650px',
            width: '100%',
            position: 'relative',
            backgroundColor: '#070b14',
          }}
          className="cursor-crosshair"
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
                <span className="text-slate-400">Spatial Extent:</span>
                <span className="text-slate-300">~11 km × 11 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md text-[11px] font-mono">
          <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5 mb-1">
            <Layers className="h-3.5 w-3.5 text-orange-400" />
            Radiative Energy (MW)
          </span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
            <span className="text-slate-300">&gt; 50,000 MW (Extreme Cluster)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f97316]" />
            <span className="text-slate-300">15,000 – 50,000 MW (High)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#eab308]" />
            <span className="text-slate-300">5,000 – 15,000 MW (Elevated)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#38bdf8]" />
            <span className="text-slate-300">&lt; 5,000 MW (Moderate)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
