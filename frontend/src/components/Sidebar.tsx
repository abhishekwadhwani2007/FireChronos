import React from 'react';
import {
  Flame,
  Calendar,
  Sparkles,
  MapPin,
  Radio,
  TrendingUp,
  Database,
  Satellite,
  ChevronRight,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { COUNTRIES } from '../data/countryZones';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCountry: string;
  setSelectedCountry: (countryId: string) => void;
  totalDetections?: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedCountry,
  setSelectedCountry,
  totalDetections = 20935359,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    {
      id: 'calendar',
      label: 'Burning Calendar',
      icon: Calendar,
      badge: '2,503 Days',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Daily thermal activity index & anomaly matrix',
    },
    {
      id: 'forecast',
      label: '7-Day AI Forecast',
      icon: Sparkles,
      badge: 'ML Ensemble',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: 'Predictive HAI regression & spatial corridors',
    },
    {
      id: 'map',
      label: 'Geospatial Grid',
      icon: MapPin,
      badge: '18 Zones',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'Interactive map & national fire boundaries',
    },
    {
      id: 'sensor-lab',
      label: 'Sensor Lab',
      icon: Radio,
      badge: 'MODIS vs VIIRS',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: '375m vs 1km resolution comparison & footprint',
    },
    {
      id: 'trends',
      label: 'Historical Trends',
      icon: TrendingUp,
      badge: '2020–2026',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Seasonal burning cycles & anomaly trends',
    },
    {
      id: 'data-center',
      label: 'Data & Provenance',
      icon: Database,
      badge: 'NASA FIRMS',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Tri-satellite ingest schema & raw archives',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-[#070b15]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Mission Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/40">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-white text-base font-sans">
                  FIRECHRONOS
                </span>
              </div>
              <p className="text-[10px] font-mono text-orange-400/90 tracking-tight">
                NASA SPACE APPS 2026
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Constellation Status Card */}
        <div className="p-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Tri-Satellite Array
              </span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>MODIS C6.1 + VIIRS N20/21</span>
              <span className="text-slate-300 font-bold">{totalDetections.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 custom-scrollbar">
          <div className="px-3 pb-1 pt-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Mission Telemetry & Analytics
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border-l-4 border-orange-500 text-white shadow-sm shadow-orange-500/5'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                        : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-sans tracking-wide">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold shrink-0 ${
                    isActive ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}

          {/* Quick Country Domain Selector */}
          <div className="pt-4 px-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              <span className="flex items-center gap-1">
                <Globe2 className="h-3 w-3 text-orange-400" />
                Active Asian Domain
              </span>
              <span className="text-slate-400 font-normal">9 Nations</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {COUNTRIES.slice(0, 6).map((c) => {
                const isSelected = selectedCountry === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCountry(c.id)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-[11px] font-mono transition-all ${
                      isSelected
                        ? 'border-orange-500/60 bg-orange-500/15 text-white font-bold'
                        : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span className="truncate">{c.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Mission System Health Card */}
        <div className="border-t border-slate-800/80 p-3.5 bg-slate-950/80 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Dual-Head Model
            </span>
            <span className="text-emerald-400 font-bold">R² 95.3%</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-900">
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              API: 200 OK
            </span>
            <span className="text-slate-400">v2.1 Pan-Asia</span>
          </div>
        </div>
      </aside>
    </>
  );
};
