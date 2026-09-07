import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Sparkles } from 'lucide-react';
import { BikeModel, AppSettings } from '../types';
import { generateStandaloneHtmlCode } from '../utils/generateStandaloneHtml';

interface ExportStandaloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  bikes: BikeModel[];
  settings: AppSettings;
}

export const ExportStandaloneModal: React.FC<ExportStandaloneModalProps> = ({
  isOpen,
  onClose,
  bikes,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlContent = generateStandaloneHtmlCode(bikes, settings);

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle_financing_calculator_standalone.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Standalone Single-File HTML</h3>
              <p className="text-xs text-slate-400">Zero-dependency portable webpage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <p className="text-slate-600 leading-relaxed">
            This export produces a completely self-contained, production-ready <strong className="text-slate-900 font-mono">.html</strong> file with all CSS, JavaScript logic, Lucide Icons, and jsPDF bundled directly inside.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Features Included in Export:
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Both User Mode (with 3 client tools) and Admin Panel</li>
              <li>Pre-populated with all {bikes.length} current bike inventory records</li>
              <li>Offline browser calculation engine & amortization schedules</li>
              <li>jsPDF client-side quotation generation</li>
            </ul>
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download .HTML File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
