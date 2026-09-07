import React, { useState, useEffect } from 'react';
import { Home, Languages, RefreshCw, RotateCcw } from 'lucide-react';
import { AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';

interface NavbarProps {
  currentMode: 'user' | 'admin';
  isAdminAuthenticated: boolean;
  onSwitchMode: (mode: 'user' | 'admin') => void;
  onLogoutAdmin: () => void;
  onHome: () => void;
  onReload: () => void;
  settings: AppSettings;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTool?: 'calculator' | 'schedule';
  onSelectTool?: (tool: 'calculator' | 'schedule') => void;
  isOnline: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  isAdminAuthenticated,
  onSwitchMode,
  onLogoutAdmin,
  onHome,
  onReload,
  language,
  onLanguageChange,
  activeTool = 'calculator',
  onSelectTool,
  isOnline,
  isSyncing = false,
  onManualSync,
}) => {
  const t = translations[language];
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="shrink-0">
      <header className="bg-[#dbeafe] text-[#1B365D] shadow-lg border-b-4 border-[#E32636]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <img src="/assets/monik-logo.svg" alt="Monik Group of Companies" className="h-20 w-52 sm:h-24 sm:w-64 shrink-0 rounded-xl bg-white object-contain p-2 shadow" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-black tracking-wide leading-tight whitespace-nowrap">
                  <span className="text-[#E32636]">MONIK</span>{' '}
                  <span className="text-[#1B365D]">GROUP OF COMPANIES</span>
                </h1>
                <p className="text-sm sm:text-base text-black font-black tracking-wider uppercase mt-1">CHAIRMAN OFFICE</p>
              </div>
            </div>
            <div className="text-left lg:text-right text-xs sm:text-sm font-bold text-[#1B365D] whitespace-nowrap">
              <div>{currentDateTime.toLocaleDateString('en-GB')}</div>
              <div>{currentDateTime.toLocaleTimeString('en-GB')}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#93c5fd] pt-3">
            <button type="button" onClick={onHome} className="nav-action"><Home className="w-4 h-4" /> Home</button>
            <button type="button" onClick={onReload} className="nav-action"><RotateCcw className="w-4 h-4" /> Reload</button>
            {currentMode === 'user' && onSelectTool && (
              <>
                <button type="button" onClick={() => onSelectTool('calculator')} className={`nav-action ${activeTool === 'calculator' ? 'nav-action-active' : ''}`}>Calculate</button>
                <button type="button" onClick={() => onSelectTool('schedule')} className={`nav-action ${activeTool === 'schedule' ? 'nav-action-active' : ''}`}>Amortization Schedule</button>
              </>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="bg-white/70 text-[#1B365D] px-3 py-1.5 rounded-lg font-bold text-xs">{currentMode === 'user' ? t.roleUser : t.roleAdmin}</span>
              {currentMode === 'user' ? (
                <button onClick={() => onSwitchMode('admin')} className="nav-admin">Open Admin</button>
              ) : (
                <button onClick={onLogoutAdmin} className="nav-admin">Close Admin</button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B365D]">
                <Languages className="w-4 h-4" />
                <select value={language} onChange={(e) => onLanguageChange(e.target.value as Language)} className="bg-white rounded px-2 py-1 border border-[#93c5fd] outline-none font-bold cursor-pointer">
                  <option value="en">English</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
              <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {onManualSync && <button type="button" onClick={onManualSync} disabled={isSyncing} title="Sync data now" className="text-[#1B365D] hover:text-[#E32636] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /></button>}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
