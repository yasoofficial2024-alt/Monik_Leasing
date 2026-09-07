import React, { useState } from 'react';
import { Lock, X, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';
import { signInAdmin } from '../utils/supabaseSync';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  settings: AppSettings;
  language?: Language;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settings,
  language = 'en',
}) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsSubmitting(true);
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      const result = await signInAdmin(email.trim(), password, settings);
      setIsSubmitting(false);
      if (!result.success) {
        setError(result.error || 'Unable to sign in.');
        return;
      }
      setError('');
      setEmail('');
      setPassword('');
      onSuccess();
      return;
    }

    const validPassword = settings.adminPasswordHash || 'admin';
    setIsSubmitting(false);
    if (password === validPassword) {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('Incorrect password. Default is "admin".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        id="admin-login-dialog"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative bg-[#1B365D] px-5 py-4 text-white border-b-2 border-[#E32636]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E32636] rounded-lg text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{t.roleAdmin} Authentication</h3>
              <p className="text-xs text-rose-200">Protected management and inventory console</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {settings.supabaseUrl && settings.supabaseAnonKey && <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email</label>
            <input
              id="admin-email-input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@your-company.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all text-slate-900"
              required
            />
          </div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={settings.supabaseUrl && settings.supabaseAnonKey ? 'Enter Supabase password' : 'Enter password (default: admin)'}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all text-slate-900"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-[#1B365D] hover:underline font-semibold"
            >
              {showHint ? 'Hide default credentials' : 'Forgot password?'}
            </button>
            <span className="text-slate-400 text-[11px]">{settings.supabaseUrl && settings.supabaseAnonKey ? 'Supabase Auth' : 'Default: "admin"'}</span>
          </div>

          {showHint && !settings.supabaseUrl && !settings.supabaseAnonKey && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Default credentials
              </p>
              <p className="text-[11px]">
                The default password is <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">admin</strong>. You can change it inside the Admin Panel after unlocking.
              </p>
            </div>
          )}

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              id="admin-submit-btn"
              type="submit"
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-[#E32636] hover:bg-[#C81E2B] rounded-lg shadow-xs transition-all"
            >
              {isSubmitting ? 'Signing in...' : 'Unlock Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
