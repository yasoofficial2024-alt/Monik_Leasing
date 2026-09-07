import React, { useState, useEffect, useCallback } from 'react';
import { BikeModel, AppSettings } from './types';
import {
  loadStoredBikes,
  saveStoredBikes,
  loadStoredSettings,
  saveStoredSettings,
  resetToFactoryDefaults,
  wipeAllStoredData,
  checkIsAdminAuthenticated,
  setAdminAuthenticated,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { UserCalculator } from './components/UserCalculator';
import { Language, translations } from './utils/i18n';
import { getSupabaseClient, signOutAdmin, syncFromSupabase, syncToSupabase } from './utils/supabaseSync';

export default function App() {
  const [bikes, setBikes] = useState<BikeModel[]>(() => loadStoredBikes());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [currentMode, setCurrentMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => checkIsAdminAuthenticated());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeUserTool, setActiveUserTool] = useState<'calculator' | 'schedule'>('calculator');
  const [calculatorReloadToken, setCalculatorReloadToken] = useState(0);
  const [language, setLanguage] = useState<Language>('en');

  // Offline / Online state management
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const t = translations[language];

  useEffect(() => {
    const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
    if (!client) return;

    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setIsAdminAuthenticated(true);
        setAdminAuthenticated(true);
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAdminAuthenticated(false);
        setAdminAuthenticated(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [settings.supabaseUrl, settings.supabaseAnonKey]);

  // Monitor Network Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online if Supabase configured
      performAutoSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial background sync check on load if online
    if (navigator.onLine && settings.supabaseUrl && settings.supabaseAnonKey) {
      performAutoSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.supabaseUrl, settings.supabaseAnonKey]);

  // Automatic sync function
  const performAutoSync = useCallback(async () => {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) return;
    setIsSyncing(true);
    try {
      const res = await syncFromSupabase(settings);
      if (res.success && res.data && res.data.length > 0) {
        setBikes(res.data);
        saveStoredBikes(res.data);
      }
    } catch (e) {
      console.warn('Auto-sync background notice:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [settings]);

  // Sync bikes state (localStorage + optional Supabase)
  const handleUpdateBikes = (newBikes: BikeModel[]) => {
    setBikes(newBikes);
    saveStoredBikes(newBikes);

    // Background push to Supabase if connected
    if (isOnline && settings.supabaseUrl && settings.supabaseAnonKey) {
      syncToSupabase(newBikes, settings).catch((err) => {
        console.warn('Supabase background push error:', err);
      });
    }
  };

  // Sync settings state
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Factory reset
  const handleResetDefaults = async () => {
    const { bikes: resetBikes, settings: resetSettings } = resetToFactoryDefaults();
    setBikes(resetBikes);
    setSettings(resetSettings);
    if (isOnline && settings.supabaseUrl && settings.supabaseAnonKey) {
      const result = await syncToSupabase(resetBikes, settings);
      if (!result.success) throw new Error(result.error || 'Factory reset database sync failed.');
    }
  };

  // Complete wipe of all saved records
  const handleWipeDatabase = async () => {
    const { bikes: wipedBikes } = wipeAllStoredData();
    setBikes(wipedBikes);
    if (isOnline && settings.supabaseUrl && settings.supabaseAnonKey) {
      const result = await syncToSupabase(wipedBikes, settings);
      if (!result.success) throw new Error(result.error || 'Database wipe failed.');
    }
  };

  // Mode switching logic
  const handleSwitchMode = (mode: 'user' | 'admin') => {
    if (mode === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentMode('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      setCurrentMode('user');
    }
  };

  // Admin login success
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setAdminAuthenticated(true);
    setIsLoginModalOpen(false);
    setCurrentMode('admin');
  };

  // Admin logout
  const handleLogoutAdmin = () => {
    signOutAdmin(settings).catch((err) => console.warn('Supabase sign-out error:', err));
    setIsAdminAuthenticated(false);
    setAdminAuthenticated(false);
    setCurrentMode('user');
  };

  const handleHome = () => {
    setCurrentMode('user');
    setActiveUserTool('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReload = () => {
    setCurrentMode('user');
    setActiveUserTool('calculator');
    setCalculatorReloadToken((token) => token + 1);
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans antialiased">
      {/* Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onSwitchMode={handleSwitchMode}
        onLogoutAdmin={handleLogoutAdmin}
        onHome={handleHome}
        onReload={handleReload}
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
        activeTool={activeUserTool}
        onSelectTool={setActiveUserTool}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onManualSync={performAutoSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {currentMode === 'user' ? (
          <UserCalculator
            bikes={bikes}
            settings={settings}
            language={language}
            activeTool={activeUserTool}
            onSelectTool={setActiveUserTool}
            onCleanReset={handleReload}
            reloadToken={calculatorReloadToken}
          />
        ) : (
          <AdminPanel
            bikes={bikes}
            settings={settings}
            language={language}
            onUpdateBikes={handleUpdateBikes}
            onUpdateSettings={handleUpdateSettings}
            onResetDefaults={handleResetDefaults}
            onWipeDatabase={handleWipeDatabase}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#dbeafe] border-t border-[#93c5fd] py-6 text-xs text-slate-600 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="font-black text-[#1B365D]">MONIK GROUP OF COMPANIES | DEPARTMENT OF CHAIRMAN OFFICE</div>
          <div>© 2026 MONIK GROUP. All Rights Reserved.</div>
          <div className="font-semibold">Version 1.0.0 <span className="mx-1">•</span> Secure Internal System</div>
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-semibold">
            <a href="/privacy.html" className="hover:text-[#E32636] hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/terms.html" className="hover:text-[#E32636] hover:underline">Terms</a>
            <span>•</span>
            <a href="/help.html" className="hover:text-[#E32636] hover:underline">Help &amp; Support</a>
            <span>•</span>
            <a href="/contact.html" className="hover:text-[#E32636] hover:underline">Contact</a>
          </nav>
        </div>
      </footer>

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        settings={settings}
        language={language}
      />

    </div>
  );
}
