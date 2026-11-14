import React from 'react';
import { Flame, Calendar, BarChart3, MapPin, Database, Satellite, TrendingUp } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalDetections?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalDetections = 20935359,
}) => {
  const tabs = [
    { id: 'calendar', label: 'Burning Calendar', icon: Calendar },
    { id: 'forecast', label: '7-Day AI Forecast', icon: TrendingUp, highlight: true },
    { id: 'sensor-lab', label: 'Sensor Comparison Lab', icon: Satellite },
    { id: 'trends', label: 'Historical Trends', icon: BarChart3 },
    { id: 'map', label: 'Geospatial Grid', icon: MapPin },
    { id: 'data-center', label: 'Data & Provenance', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 shadow-md shadow-orange-500/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">FIRECHRONOS</span>
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-500/30 font-mono">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              One Planet. Tri-Satellite System. One Harmonized Fire Record.
            </p>
          </div>
        </div>

        {/* Global Dataset Status Pill */}
        <div className="hidden xl:flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs font-mono">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Domain:</span>
          <span className="font-semibold text-white">Pan-Asia</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Authentic Records:</span>
          <span className="font-medium text-orange-400">
            {totalDetections.toLocaleString()}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400">2020–2026</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-orange-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
