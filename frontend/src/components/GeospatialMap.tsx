import React, { useEffect, useRef, useState, useMemo } from 'react';
import { fetchGrid } from '../api';
import { GridCell } from '../types';
import { COUNTRIES, COUNTRY_ZONES, CountryMeta, CountryZone } from '../data/countryZones';
import L from 'leaflet';
import {
  MapPin,
  Flame,
  ZoomIn,
  ZoomOut,
  Layers,
  Globe,
  Navigation,
  Calendar,
  Compass,
  Maximize2
} from 'lucide-react';

type BaseMapStyle = 'dark' | 'osm' | 'satellite';

export const GeospatialMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonePolygonLayerRef = useRef<L.LayerGroup | null>(null);
  const baseLayersRef = useRef<L.LayerGroup | null>(null);

  const [cells, setCells] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [minEnergyFilter, setMinEnergyFilter] = useState<number>(0);
  const [baseMap, setBaseMap] = useState<BaseMapStyle>('dark');

  // Country & Zone Navigation State
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<CountryZone | null>(null);

  // Available zones for currently selected country
  const availableZones = useMemo(() => {
    if (selectedCountry === 'all') return COUNTRY_ZONES;
    return COUNTRY_ZONES.filter((z) => z.countryId === selectedCountry);
  }, [selectedCountry]);

  // Load 0.1° grid cells across Asia
  useEffect(() => {
    setLoading(true);
    fetchGrid('asia', 2500)
      .then((res) => {
        setCells(res.cells || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load spatial grid from asia, falling back:', err);
        fetchGrid('india', 2000)
          .then((res) => {
            setCells(res.cells || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  // Initialize Map with guaranteed clean container & reliable zero-key basemaps
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Map cleanup error:', e);
      }
      mapInstanceRef.current = null;
    }
    container.innerHTML = '';
    (container as any)._leaflet_id = null;

    const map = L.map(container, {
      center: [25.0, 80.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    const baseGroup = L.layerGroup().addTo(map);
    baseLayersRef.current = baseGroup;

    // Apply selected basemap layer (Zero API Key Required - Public GIS standard)
    applyBaseMap(baseGroup, baseMap);

    // Layer groups for markers and highlighted zones
    const zonePolys = L.layerGroup().addTo(map);
    zonePolygonLayerRef.current = zonePolys;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Multiple layout passes to guarantee canvas rendering
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

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
        markersLayerRef.current = null;
        zonePolygonLayerRef.current = null;
        baseLayersRef.current = null;
      }
    };
  }, []);

  // Helper to switch basemaps without recreating map instance
  const applyBaseMap = (group: L.LayerGroup, style: BaseMapStyle) => {
    group.clearLayers();

    if (style === 'dark') {
      // 1. Esri World Dark Gray Base (No API key, zero watermark, high contrast)
      const darkBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, attribution: 'Tiles © Esri, DeLorme, NAVTEQ' }
      );
      // 2. Esri World Dark Gray Reference (Labels & International Borders)
      const darkRef = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, pane: 'overlayPane' }
      );
      group.addLayer(darkBase);
      group.addLayer(darkRef);
    } else if (style === 'osm') {
      // OpenStreetMap Standard Cartography (No API key)
      const osm = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18, attribution: '© OpenStreetMap contributors' }
      );
      group.addLayer(osm);
    } else if (style === 'satellite') {
      // Esri World Imagery (High-res Satellite) + Place Labels
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 17, attribution: 'Source: Esri, Maxar, Earthstar Geographics' }
      );
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 17, pane: 'overlayPane' }
      );
      group.addLayer(sat);
      group.addLayer(labels);
    }
  };

  // Basemap switch listener
  useEffect(() => {
    if (baseLayersRef.current) {
      applyBaseMap(baseLayersRef.current, baseMap);
    }
  }, [baseMap]);

  // Filtered cells based on user energy slider AND selected zone bounds (if any)
  const filteredCells = useMemo(() => {
    let result = cells;

    if (minEnergyFilter > 0) {
      result = result.filter((c) => c.frp_sum >= minEnergyFilter);
    }

    if (selectedZone) {
      const [[south, west], [north, east]] = selectedZone.bounds;
      result = result.filter(
        (c) => c.lat >= south && c.lat <= north && c.lon >= west && c.lon <= east
      );
    }

    return result;
  }, [cells, minEnergyFilter, selectedZone]);

  // Zone statistics
  const zoneStats = useMemo(() => {
    if (!selectedZone) {
      return {
        totalCells: filteredCells.length,
        totalDetections: filteredCells.reduce((acc, c) => acc + c.count, 0),
        totalFRP: filteredCells.reduce((acc, c) => acc + c.frp_sum, 0),
      };
    }
    const zoneCells = filteredCells;
    return {
      totalCells: zoneCells.length,
      totalDetections: zoneCells.reduce((acc, c) => acc + c.count, 0),
      totalFRP: zoneCells.reduce((acc, c) => acc + c.frp_sum, 0),
    };
  }, [filteredCells, selectedZone]);

  // Draw Highlighted Zone Boundary Polygon when zone changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const zg = zonePolygonLayerRef.current;
    if (!map || !zg) return;

    zg.clearLayers();

    if (selectedZone) {
      const [[s, w], [n, e]] = selectedZone.bounds;
      const bounds = L.latLngBounds([s, w], [n, e]);

      const poly = L.rectangle(bounds, {
        color: selectedZone.color || '#f97316',
        weight: 2,
        dashArray: '4, 6',
        fillColor: selectedZone.color || '#f97316',
        fillOpacity: 0.12,
      });

      poly.bindPopup(`
        <div style="font-family: -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 4px; min-width: 200px;">
          <div style="font-weight: 800; color: #ea580c; font-size: 13px; margin-bottom: 2px;">
            ${selectedZone.flag} ${selectedZone.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${selectedZone.countryName}</div>
          <div style="font-size: 11px; margin-bottom: 4px;"><strong>Peak Months:</strong> ${selectedZone.peakMonths}</div>
          <div style="font-size: 11px; color: #334155;">${selectedZone.fireEcology}</div>
        </div>
      `);

      zg.addLayer(poly);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [selectedZone]);

  // Render Hotspot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const mg = markersLayerRef.current;
    if (!map || !mg) return;

    mg.clearLayers();
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
        weight: 0.6,
        opacity: 0.9,
        fillOpacity: 0.75,
      });

      marker.on('click', () => {
        setSelectedCell(c);
      });

      marker.bindPopup(`
        <div style="font-family: -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 6px; min-width: 190px;">
          <div style="font-weight: 700; color: #ea580c; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
            0.1° × 0.1° Hotspot Cell (~11 km)
          </div>
          <div><strong>Coordinates:</strong> ${c.lat.toFixed(2)}°N, ${c.lon.toFixed(2)}°E</div>
          <div><strong>Fires Recorded:</strong> ${c.count.toLocaleString()} detections</div>
          <div><strong>Radiative Power:</strong> ${Math.round(c.frp_sum).toLocaleString()} MW</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">NASA Harmonized Multi-Sensor (M+J1+J2)</div>
        </div>
      `);

      mg.addLayer(marker);
    });

    map.invalidateSize();
  }, [filteredCells]);

  // Handle Country selection change
  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedZone(null);

    const countryMeta = COUNTRIES.find((c) => c.id === countryId);
    if (countryMeta && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(countryMeta.center, countryMeta.zoom, { duration: 1.2 });
    }
  };

  // Handle Zone card click
  const handleZoneClick = (zone: CountryZone) => {
    if (selectedZone?.id === zone.id) {
      setSelectedZone(null); // toggle off
      // Reset to country center
      const countryMeta = COUNTRIES.find((c) => c.id === zone.countryId);
      if (countryMeta && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(countryMeta.center, countryMeta.zoom, { duration: 1.2 });
      }
    } else {
      setSelectedZone(zone);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const resetView = () => {
    setSelectedCountry('all');
    setSelectedZone(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([25.0, 80.0], 4, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Basemap Switcher */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20 font-mono">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                PAN-ASIAN GEOSPATIAL INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400">
                • 0.1° × 0.1° Grid • Transboundary Country Zones
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Active Fire Hotspots & National Ecological Zones
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl">
              High-resolution spatial analysis synthesizing 20.9M authentic NASA satellite detections (MODIS C6.1 + VIIRS NOAA-20/21).
              Explore specific regional fire corridors and burning seasons across 9 Asian nations.
            </p>
          </div>

          {/* Basemap Switcher (Clean Esri & OSM - No API Key, No Watermark) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 font-mono text-xs shrink-0">
            <Globe className="h-4 w-4 text-sky-400 ml-2" />
            <span className="text-slate-400 mr-1 text-[11px]">Basemap:</span>
            <button
              onClick={() => setBaseMap('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'dark'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Dark Gray
            </button>
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'satellite'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBaseMap('osm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                baseMap === 'osm'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Street (OSM)
            </button>
          </div>
        </div>

        {/* COUNTRY SELECTOR STRIP & REGIONAL DISTRIBUTION */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-sky-400" />
              Pan-Asian Country Domains & Fire Share:
            </span>
            {selectedZone && (
              <button
                onClick={resetView}
                className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
                Reset Pan-Asia View
              </button>
            )}
          </div>

          {/* Regional Fire Distribution Bar */}
          <div className="h-2 w-full rounded-full bg-slate-950 flex overflow-hidden border border-slate-800 mb-3 shadow-inner">
            <div style={{ width: '41.9%', backgroundColor: '#0284c7' }} title="India: 41.9%" />
            <div style={{ width: '35.2%', backgroundColor: '#06b6d4' }} title="China: 35.2%" />
            <div style={{ width: '8.0%', backgroundColor: '#10b981' }} title="Pakistan: 8.0%" />
            <div style={{ width: '5.8%', backgroundColor: '#f59e0b' }} title="Eastern Iran: 5.8%" />
            <div style={{ width: '4.4%', backgroundColor: '#3b82f6' }} title="Afghanistan: 4.4%" />
            <div style={{ width: '3.1%', backgroundColor: '#8b5cf6' }} title="Malaysia: 3.1%" />
            <div style={{ width: '0.9%', backgroundColor: '#38bdf8' }} title="Nepal & Bhutan: 0.9%" />
            <div style={{ width: '0.7%', backgroundColor: '#ec4899' }} title="Sri Lanka: 0.7%" />
          </div>

          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => {
              const isCurrent = selectedCountry === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCountryChange(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 ring-1 ring-sky-400/50'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COUNTRY SPECIFIC ZONES STRIP */}
        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
            {selectedCountry === 'all'
              ? 'Highlighted Pan-Asian Fire Zones (Click to inspect & zoom):'
              : `${COUNTRIES.find((c) => c.id === selectedCountry)?.name} Specific Fire Zones:`}
          </span>
          <div className="flex flex-wrap gap-2">
            {availableZones.map((z) => {
              const isZoneActive = selectedZone?.id === z.id;
              return (
                <button
                  key={z.id}
                  onClick={() => handleZoneClick(z)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isZoneActive
                      ? 'bg-blue-600/25 border border-sky-400 text-sky-200 font-bold shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-xs">{z.flag}</span>
                  <span>{z.name}</span>
                  <span
                    className={`ml-1 text-[9px] px-1.5 py-0.2 rounded uppercase ${
                      z.riskLevel === 'ELEVATED'
                        ? 'bg-amber-500/20 text-amber-400'
                        : z.riskLevel === 'NOMINAL'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    {z.riskLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Slider & Live Telemetry */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-5 border-t border-slate-800/80 font-mono text-xs">
          {/* Energy Slider */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 shrink-0">Filter Radiative Energy:</span>
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={minEnergyFilter}
              onChange={(e) => setMinEnergyFilter(Number(e.target.value))}
              className="w-36 sm:w-48 accent-sky-400"
            />
            <span className="text-sky-400 font-bold min-w-[70px]">
              {minEnergyFilter === 0 ? 'All MW' : `≥ ${minEnergyFilter.toLocaleString()} MW`}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Active Cells:</span>
              <span className="text-sky-400 font-bold">{zoneStats.totalCells.toLocaleString()}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Detections:</span>
              <span className="text-white font-bold">{zoneStats.totalDetections.toLocaleString()}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Total FRP:</span>
              <span className="text-cyan-400 font-bold">{Math.round(zoneStats.totalFRP).toLocaleString()} MW</span>
            </div>
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

        {/* Map Container with guaranteed sizing */}
        <div
          ref={mapContainerRef}
          style={{
            height: '650px',
            minHeight: '650px',
            width: '100%',
            position: 'relative',
            backgroundColor: '#111827',
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

        {/* SELECTED ZONE INTELLIGENCE CARD (Top-Right Overlay) */}
        {selectedZone && (
          <div className="absolute top-4 right-4 z-[400] w-84 max-w-[90vw] rounded-2xl border border-sky-500/40 bg-slate-950/95 p-4 shadow-2xl shadow-sky-500/20 backdrop-blur-md">
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-800 mb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-sky-400" />
                  National Fire Zone Focus
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span>{selectedZone.flag}</span>
                  <span>{selectedZone.name}</span>
                </h3>
                <span className="text-[11px] text-sky-400 font-mono">{selectedZone.countryName}</span>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-slate-800"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-300 font-sans border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold mb-0.5">Fire Ecology Driver:</span>
                {selectedZone.fireEcology}
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-cyan-400" />
                  Peak Season:
                </span>
                <span className="text-white font-bold">{selectedZone.peakMonths}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Centroid:</span>
                <span className="text-sky-400 font-bold">{selectedZone.centroid[0]}°N, {selectedZone.centroid[1]}°E</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Zone Fires in View:</span>
                <span className="text-white font-bold">{zoneStats.totalDetections.toLocaleString()} detections</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Zone Radiative Energy:</span>
                <span className="text-cyan-400 font-bold">{Math.round(zoneStats.totalFRP).toLocaleString()} MW</span>
              </div>

              <div className="pt-1 text-[11px]">
                <span className="text-slate-400 block text-[10px] uppercase mb-0.5">Key Provinces & Districts:</span>
                <span className="text-slate-200">{selectedZone.keyProvinces.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Cell Detail Card (when user clicks an individual hotspot dot) */}
        {selectedCell && !selectedZone && (
          <div className="absolute top-4 right-4 z-[400] w-80 rounded-2xl border border-sky-500/40 bg-slate-950/95 p-4 shadow-2xl shadow-sky-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 font-mono">
                <Flame className="h-4 w-4 text-sky-400 animate-pulse" />
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
                <span className="text-slate-400">Total Radiative Power:</span>
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
