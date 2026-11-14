import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { SensorLab } from './components/SensorLab';
import { HistoricalTrends } from './components/HistoricalTrends';
import { GeospatialMap } from './components/GeospatialMap';
import { DataCenter } from './components/DataCenter';
import { DayDetailModal } from './components/DayDetailModal';
import { ForecastPanel } from './components/ForecastPanel';
import { fetchCalendar, fetchDayDetail } from './api';
import { CalendarResponse, DayDetail } from './types';
import { Flame, ExternalLink, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('calendar');
  const [mode, setMode] = useState<'harmonized' | 'viirs' | 'modis'>('harmonized');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [dayDetailLoading, setDayDetailLoading] = useState<boolean>(false);

  // Load calendar on mount or when mode changes
  useEffect(() => {
    setCalendarLoading(true);
    fetchCalendar('asia', '2020-01-01', '2026-11-13', mode)
      .then((res) => {
        setCalendarData(res);
        setCalendarLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calendar:', err);
        setCalendarLoading(false);
      });
  }, [mode]);

  // Load day detail when a date is selected
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setDayDetailLoading(true);
    fetchDayDetail('india', date)
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

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDetections={calendarData?.summary.total_detections || 20935359}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'calendar' && (
          <CalendarView
            data={calendarData}
            loading={calendarLoading}
            mode={mode}
            setMode={setMode}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onSelectDate={handleSelectDate}
          />
        )}

        {activeTab === 'sensor-lab' && <SensorLab />}

        {activeTab === 'trends' && <HistoricalTrends onSelectDate={handleSelectDate} />}

        {activeTab === 'map' && <GeospatialMap />}

        {activeTab === 'data-center' && <DataCenter />}

        {activeTab === 'forecast' && <ForecastPanel />}
      </main>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          dayDetail={dayDetail}
          loading={dayDetailLoading}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-slate-300">FIRECHRONOS</span>
            <span>— NASA Space Apps Challenge 2026</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Earth Science / Geospatial Intelligence</span>
            <span>•</span>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              NASA FIRMS Data
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              NASA FIRMS Observation Record
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
