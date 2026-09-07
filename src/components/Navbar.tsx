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

  return (
    <div className="shrink-0">
      {/* TOP BAR */}
      <div className="bg-[#122440] text-slate-200 text-xs py-2 px-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-2">
          {/* Language Switcher & Offline/Online Status */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center space-x-1.5">
              <Languages className="w-4 h-4 text-[#E32636]" />
              <span className="font-semibold text-slate-400">{t.langLbl}</span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 outline-none font-bold text-xs cursor-pointer hover:border-slate-400 transition"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            {/* Online / Offline Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300">Online (Auto-sync)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-amber-300">Offline (Local Cache)</span>
                </>
              )}

              {onManualSync && (
                <button
                  type="button"
                  onClick={onManualSync}
                  disabled={isSyncing}
                  title="Sync data now"
                  className="ml-1 text-slate-400 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Role Status & Toggle Button */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onHome}
              title="Home"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded font-semibold transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={onReload}
              title="Clear calculator"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload</span>
            </button>
            <span className="bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              {currentMode === 'user' ? t.roleUser : t.roleAdmin}
            </span>

            {currentMode === 'user' ? (
              <button
                onClick={() => onSwitchMode('admin')}
                className="bg-[#E32636] hover:bg-[#C81E2B] text-white px-2.5 py-0.5 rounded text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>{t.btnAdminLogin}</span>
              </button>
            ) : (
              <button
                onClick={onLogoutAdmin}
                className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-0.5 rounded text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>{t.btnAdminExit}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-[#1B365D] text-white shadow-lg border-b-4 border-[#E32636]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <img src="/assets/monik-logo.svg" alt="Monik Group of Companies" className="h-14 w-40 sm:h-16 sm:w-48 shrink-0 rounded-lg bg-white object-contain p-1 shadow" />
            <div>
              <h1 className="text-base sm:text-xl font-black tracking-wide leading-tight">{t.hdrTitle}</h1>
              <p className="text-xs text-rose-300 font-bold tracking-wider uppercase mt-0.5">{t.hdrSub}</p>
            </div>
          </div>

          {/* User Tool Nav: Calculator & Schedule Preview */}
          {currentMode === 'user' && onSelectTool && (
            <div className="flex w-full sm:w-auto items-center gap-2 bg-slate-900/40 p-1 rounded-lg border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => onSelectTool('calculator')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded transition cursor-pointer ${
                  activeTool === 'calculator'
                    ? 'bg-[#E32636] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.btnCalc}
              </button>
              <button
                type="button"
                onClick={() => onSelectTool('schedule')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded transition cursor-pointer ${
                  activeTool === 'schedule'
                    ? 'bg-[#E32636] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.scheduleTab}
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};
