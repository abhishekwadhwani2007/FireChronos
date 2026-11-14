import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { SensorLab } from './components/SensorLab';
import { HistoricalTrends } from './components/HistoricalTrends';
import { GeospatialMap } from './components/GeospatialMap';
import { DataCenter } from './components/DataCenter';
import { DayDetailModal } from './components/DayDetailModal';
import { ForecastPanel } from './components/ForecastPanel';
import { CinematicLanding } from './components/CinematicLanding';
import { fetchCalendar, fetchDayDetail } from './api';
import { CalendarResponse, DayDetail } from './types';
import { COUNTRIES } from './data/countryZones';
import {
  Flame,
  ExternalLink,
  ShieldCheck,
  Menu,
  Globe2,
  Sparkles,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';

export function App() {
  const [isEntered, setIsEntered] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#main';
  });
  const [activeTab, setActiveTab] = useState<string>('calendar');
  const [mode, setMode] = useState<'harmonized' | 'viirs' | 'modis'>('harmonized');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [dayDetailLoading, setDayDetailLoading] = useState<boolean>(false);

  // Sync hash state
  useEffect(() => {
    const handleHash = () => {
      setIsEntered(window.location.hash === '#main');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleReturnToLanding = () => {
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      window.location.hash = '';
    }
    setIsEntered(false);
  };

  // Load calendar when mode or country changes
  useEffect(() => {
    setCalendarLoading(true);
    const regionParam = selectedCountry === 'all' ? 'asia' : selectedCountry;
    fetchCalendar(regionParam, '2020-01-01', '2026-11-13', mode)
      .then((res) => {
        setCalendarData(res);
        setCalendarLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calendar:', err);
        setCalendarLoading(false);
      });
  }, [mode, selectedCountry]);

  // Load day detail when a date is selected
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setDayDetailLoading(true);
    const regionParam = selectedCountry === 'all' ? 'asia' : selectedCountry;
    fetchDayDetail(regionParam, date)
      .then((res) => {
        setDayDetail(res);
        setDayDetailLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load day detail:', err);
        setDayDetailLoading(false);
      });
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    setDayDetail(null);
  };

  const activeCountryMeta = COUNTRIES.find((c) => c.id === selectedCountry) || COUNTRIES[0];

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    calendar: {
      title: 'Burning Activity Matrix',
      subtitle: '2,503-Day Multi-Satellite Calendar (2020–2026)',
    },
    forecast: {
      title: '7-Day Predictive Intelligence',
      subtitle: 'Continuous HAI Regression & Dynamic Spatial Corridors',
    },
    map: {
      title: 'Geospatial Grid & National Zones',
      subtitle: '18 Country Fire Ecologies & 0.1° High-FRP Detections',
    },
    'sensor-lab': {
      title: 'Sensor Comparison & Footprint Lab',
      subtitle: '375m VIIRS vs 1,000m MODIS Resolution Benchmarks',
    },
    trends: {
      title: 'Historical Cycles & Baseline Climatology',
      subtitle: '7-Year Seasonal Cycles, Monsoon Lulls & Outliers',
    },
    'data-center': {
      title: 'Data Provenance & Archives',
      subtitle: 'NASA FIRMS Open Access & Collection 6.1 Specifications',
    },
  };

  const currentTabInfo = pageTitles[activeTab] || pageTitles.calendar;

  if (!isEntered) {
    return (
      <CinematicLanding
        onEnter={() => {
          try {
            window.history.replaceState(null, '', '#main');
          } catch {
            window.location.hash = '#main';
          }
          setIsEntered(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Sleek Aerospace Mission Control Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        totalDetections={calendarData?.summary.total_detections || 20935359}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onReturnToLanding={handleReturnToLanding}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Telemetry Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#070b15]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  {currentTabInfo.title}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {currentTabInfo.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Telemetry Badges */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            {/* Active Country Filter Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-slate-200">
              <span>{activeCountryMeta.flag}</span>
              <span className="font-bold">{activeCountryMeta.name}</span>
            </div>

            {/* Model Fit Badge */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400 font-bold">
              <Cpu className="h-3 w-3" />
              <span>R² 95.3%</span>
            </div>

            {/* Total Authentic Record Count */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-300 font-bold">
              <Flame className="h-3 w-3 text-sky-400" />
              <span>{(calendarData?.summary.total_detections || 20935359).toLocaleString()} Fires</span>
            </div>

            {/* Return to Cinematic View */}
            <button
              onClick={handleReturnToLanding}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-slate-300 hover:text-white hover:border-sky-500/50 hover:bg-slate-800 transition-all font-semibold"
              title="Return to Earth Rising Landing View"
            >
              <Globe2 className="h-3 w-3 text-sky-400" />
              <span className="hidden sm:inline">Earth View</span>
            </button>
          </div>
        </header>

        {/* Main Tab Panels */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'calendar' && (
            <CalendarView
              data={calendarData}
              loading={calendarLoading}
              mode={mode}
              setMode={setMode}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              onSelectDate={handleSelectDate}
            />
          )}

          {activeTab === 'forecast' && <ForecastPanel />}

          {activeTab === 'map' && <GeospatialMap />}

          {activeTab === 'sensor-lab' && <SensorLab />}

          {activeTab === 'trends' && <HistoricalTrends onSelectDate={handleSelectDate} />}

          {activeTab === 'data-center' && <DataCenter />}
        </main>

        {/* Day Detail Modal */}
        {selectedDate && (
          <DayDetailModal
            dayDetail={dayDetail}
            loading={dayDetailLoading}
            onClose={handleCloseModal}
          />
        )}

        {/* Polished Aerospace Mission Footer */}
        <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-400">
          <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-sky-400" />
              <span className="font-bold text-slate-300 font-mono">FIRECHRONOS</span>
              <span className="text-slate-400">— NASA Space Apps Challenge 2026</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-slate-400">Pan-Asian Tri-Satellite Constellation</span>
              <span className="text-slate-400">•</span>
              <a
                href="https://firms.modaps.eosdis.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
              >
                NASA FIRMS Archive
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Empirical Calibration Benchmark
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
