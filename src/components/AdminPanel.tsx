import React, { useState, useMemo, useRef } from 'react';
import {
  Settings,
  Save,
  PlusCircle,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Link,
  Cloud,
  CloudDownload,
  CloudUpload,
  Key,
  Lock,
  Wifi,
  WifiOff,
  Edit,
  Eye,
  Filter,
  Search,
  Layers,
  Database,
  Grid,
  List,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BikeModel, AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';
import { formatNumber } from '../utils/calculator';
import { syncFromSupabase, syncToSupabase } from '../utils/supabaseSync';
import { CATEGORIES, getBikeCategory } from '../utils/categoryHelper';
import { EditVehicleModal } from './EditVehicleModal';

interface AdminPanelProps {
  bikes: BikeModel[];
  settings: AppSettings;
  language: Language;
  onUpdateBikes: (bikes: BikeModel[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetDefaults: () => Promise<void>;
  onWipeDatabase?: () => Promise<void>;
  isOnline: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  bikes,
  settings,
  language,
  onUpdateBikes,
  onUpdateSettings,
  onResetDefaults,
  onWipeDatabase,
  isOnline,
}) => {
  const t = translations[language];

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'excel' | 'rates' | 'supabase' | 'database'>('inventory');

  // VIEW BY BRAND & MODEL CATEGORIES FILTERS
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  // INLINE ROW EDIT STATE
  const [editedRows, setEditedRows] = useState<
    Record<string, { model: string; year: number; sellingPrice: number; downpayment: number }>
  >({});
  const [savedRowIds, setSavedRowIds] = useState<Record<string, boolean>>({});

  // FULL EDIT MODAL STATE
  const [editingBike, setEditingBike] = useState<BikeModel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // GLOBAL RATES STATE
  const [docChargePct, setDocChargePct] = useState<number>(settings.defaultDocumentChargePercent || 5.0);
  const [insuranceCharge, setInsuranceCharge] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(settings.defaultInterestRate || 14.5);

  // ADD SINGLE VEHICLE FORM
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Standard / Street (126-160 CC)');
  const [newYear, setNewYear] = useState('2026');
  const [newCc, setNewCc] = useState('160');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newDp, setNewDp] = useState<number | ''>('');

  // EXCEL FILE UPLOAD
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SUPABASE CONFIGURATION STATE
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [supabaseTable, setSupabaseTable] = useState(settings.supabaseTableName || 'bikes');
  const [isSyncing, setIsSyncing] = useState(false);

  // FEEDBACK TOASTS
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Distinct Brands List
  const brands = useMemo(() => {
    return Array.from(new Set(bikes.map((b) => b.brand))).sort();
  }, [bikes]);

  // Filtered Inventory Data
  const filteredBikes = useMemo(() => {
    return bikes.filter((b) => {
      // Brand filter
      if (selectedBrand !== 'ALL' && b.brand !== selectedBrand) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All Categories') {
        const cat = getBikeCategory(b);
        if (cat !== selectedCategory) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const brandMatch = b.brand.toLowerCase().includes(q);
        const modelMatch = b.model.toLowerCase().includes(q);
        const ccMatch = (b.engineCc?.toString() || '').includes(q);
        const catMatch = getBikeCategory(b).toLowerCase().includes(q);
        if (!brandMatch && !modelMatch && !ccMatch && !catMatch) return false;
      }
      return true;
    });
  }, [bikes, selectedBrand, selectedCategory, searchQuery]);

  // Grouped by Brand then Category
  const groupedData = useMemo(() => {
    const map: Record<string, Record<string, BikeModel[]>> = {};

    filteredBikes.forEach((bike) => {
      const bBrand = bike.brand;
      const bCat = getBikeCategory(bike);

      if (!map[bBrand]) {
        map[bBrand] = {};
      }
      if (!map[bBrand][bCat]) {
        map[bBrand][bCat] = [];
      }
      map[bBrand][bCat].push(bike);
    });

    return map;
  }, [filteredBikes]);

  // Inventory Statistics
  const totalValue = useMemo(() => {
    return filteredBikes.reduce((sum, b) => sum + (b.sellingPrice || 0), 0);
  }, [filteredBikes]);

  const avgPrice = useMemo(() => {
    return filteredBikes.length > 0 ? totalValue / filteredBikes.length : 0;
  }, [filteredBikes, totalValue]);

  // 1. INLINE ROW EDIT HANDLERS
  const handleRowChange = (id: string, field: 'model' | 'year' | 'sellingPrice' | 'downpayment', value: any) => {
    const bike = bikes.find((b) => b.id === id);
    if (!bike) return;

    const current = editedRows[id] || {
      model: bike.model,
      year: bike.year,
      sellingPrice: bike.sellingPrice,
      downpayment: bike.downpayment,
    };

    setEditedRows({
      ...editedRows,
      [id]: {
        ...current,
        [field]: field === 'model' ? value.toUpperCase() : Number(value) || 0,
      },
    });

    if (savedRowIds[id]) {
      setSavedRowIds({ ...savedRowIds, [id]: false });
    }
  };

  const handleSaveRow = (id: string) => {
    const edit = editedRows[id];
    const bike = bikes.find((b) => b.id === id);
    if (!bike) return;

    const currentModel = edit ? edit.model : bike.model;
    const currentYear = edit ? edit.year : bike.year;
    const currentPrice = edit ? Math.round(edit.sellingPrice * 100) / 100 : bike.sellingPrice;
    const currentDp = edit ? Math.round(edit.downpayment * 100) / 100 : bike.downpayment;

    const updated = bikes.map((b) => {
      if (b.id !== id) return b;
      const afterDiscount = Math.max(0, currentPrice - (b.discount || 0));
      const afterDownpayment = Math.max(0, afterDiscount - currentDp);
      const docCharge = Math.round(afterDownpayment * (b.documentChargePercent / 100) * 100) / 100;
      return {
        ...b,
        model: currentModel,
        year: currentYear,
        sellingPrice: currentPrice,
        downpayment: currentDp,
        afterDiscount,
        afterDownpayment,
        documentCharge: docCharge,
        facilityAmount: afterDownpayment,
      };
    });

    onUpdateBikes(updated);
    setSavedRowIds((prev) => ({ ...prev, [id]: true }));
    showToast('success', `Saved ${currentModel} (LKR ${formatNumber(currentPrice)}).`);

    if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
      syncToSupabase(updated, settings);
    }
  };

  const handleSaveAllEditedRows = () => {
    let hasChanges = false;
    const updated = bikes.map((b) => {
      const edit = editedRows[b.id];
      if (!edit) return b;
      hasChanges = true;
      const afterDiscount = Math.max(0, edit.sellingPrice - (b.discount || 0));
      const afterDownpayment = Math.max(0, afterDiscount - edit.downpayment);
      const docCharge = Math.round(afterDownpayment * (b.documentChargePercent / 100) * 100) / 100;
      return {
        ...b,
        model: edit.model,
        year: edit.year,
        sellingPrice: edit.sellingPrice,
        downpayment: edit.downpayment,
        afterDiscount,
        afterDownpayment,
        documentCharge: docCharge,
        facilityAmount: afterDownpayment,
      };
    });

    if (hasChanges) {
      onUpdateBikes(updated);
      const newSaved: Record<string, boolean> = {};
      Object.keys(editedRows).forEach((k) => (newSaved[k] = true));
      setSavedRowIds(newSaved);
      showToast('success', 'All modified rows saved successfully!');

      if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
        syncToSupabase(updated, settings);
      }
    } else {
      showToast('info', 'No pending changes to save.');
    }
  };

  const handleDeleteBike = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from database?`)) {
      const updated = bikes.filter((b) => b.id !== id);
      onUpdateBikes(updated);
      showToast('success', `Deleted "${name}".`);

      if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
        syncToSupabase(updated, settings);
      }
    }
  };

  // FULL EDIT MODAL HANDLERS
  const handleOpenFullEdit = (bike: BikeModel) => {
    setEditingBike(bike);
    setIsEditModalOpen(true);
  };

  const handleSaveFullEdit = (updatedBike: BikeModel) => {
    const updated = bikes.map((b) => (b.id === updatedBike.id ? updatedBike : b));
    onUpdateBikes(updated);
    showToast('success', `Updated ${updatedBike.brand} ${updatedBike.model} successfully!`);

    if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
      syncToSupabase(updated, settings);
    }
  };

  // 2. ADD VEHICLE
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !newModel.trim() || !newPrice) {
      showToast('error', 'Please enter Brand, Model, and Selling Price.');
      return;
    }

    const priceNum = Math.round(Number(newPrice) * 100) / 100;
    const dpNum = Math.round((Number(newDp) || 0) * 100) / 100;
    const yearNum = parseInt(newYear) || 2026;
    const parsedCc = parseInt(newCc) || 150;
    const afterDownpayment = Math.max(0, priceNum - dpNum);
    const docCharge = Math.round(afterDownpayment * (docChargePct / 100) * 100) / 100;

    const newBike: BikeModel = {
      id: `bike-${Date.now()}`,
      brand: newBrand.trim().toUpperCase(),
      model: newModel.trim().toUpperCase(),
      category: newCategory,
      year: yearNum,
      engineCc: parsedCc,
      sellingPrice: priceNum,
      discount: 0,
      afterDiscount: priceNum,
      downpayment: dpNum,
      afterDownpayment,
      documentChargePercent: docChargePct,
      documentCharge: docCharge,
      insuranceCharge: insuranceCharge,
      rmvCharge: 8500,
      totalCharges: docCharge + insuranceCharge + 8500,
      facilityAmount: afterDownpayment,
      facilityPeriod: settings.defaultFacilityPeriod || 36,
      facilityInterestRate: interestRate,
      status: 'Available',
    };

    const updated = [newBike, ...bikes];
    onUpdateBikes(updated);
    showToast('success', `Added ${newBike.brand} ${newBike.model} to database.`);

    // Reset inputs
    setNewBrand('');
    setNewModel('');
    setNewPrice('');
    setNewDp('');
    setActiveTab('inventory');
    setSelectedBrand(newBike.brand);

    if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
      syncToSupabase(updated, settings);
    }
  };

  // 3. EXCEL UPLOAD
  const handleExcelUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showToast('error', 'Please select an Excel or CSV file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          showToast('error', 'No valid rows found in Excel sheet.');
          return;
        }

        const imported: BikeModel[] = jsonData.map((row, idx) => {
          const brand = (row.BRAND || row.Brand || 'BAJAJ').toString().toUpperCase().trim();
          const model = (row.MODEL || row.Model || `MODEL-${idx + 1}`).toString().toUpperCase().trim();
          const year = parseInt(row.YEAR || row.Year || '2026') || 2026;
          const cc = parseInt(row.CC || row.EngineCc || '150') || 150;
          const sellingPrice = Math.round(parseFloat(row['MAXIMUM RETAIL PRICE'] || row.SellingPrice || row.PRICE || row.Price || 0) * 100) / 100;
          const discount = Math.round(parseFloat(row.DISCOUNT || row.Discount || 0) * 100) / 100;
          const downpayment = Math.round(parseFloat(row.Downpayment || row.DOWNPAYMENT || 0) * 100) / 100;
          const afterDiscount = Math.max(0, sellingPrice - discount);
          const afterDownpayment = Math.max(0, afterDiscount - downpayment);
          const docCharge = Math.round(afterDownpayment * (docChargePct / 100) * 100) / 100;

          return {
            id: `excel-${Date.now()}-${idx}`,
            brand,
            model,
            category: row.Category || row.CATEGORY || undefined,
            year,
            engineCc: cc,
            sellingPrice,
            discount,
            afterDiscount,
            downpayment,
            afterDownpayment,
            documentChargePercent: docChargePct,
            documentCharge: docCharge,
            insuranceCharge: insuranceCharge,
            rmvCharge: 8500,
            totalCharges: docCharge + insuranceCharge + 8500,
            facilityAmount: afterDownpayment,
            facilityPeriod: settings.defaultFacilityPeriod || 36,
            facilityInterestRate: interestRate,
            status: 'Available',
          };
        });

        const updated = [...imported, ...bikes];
        onUpdateBikes(updated);
        showToast('success', `Imported ${imported.length} vehicles from Excel!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setActiveTab('inventory');

        if (settings.supabaseUrl && settings.supabaseAnonKey && isOnline) {
          syncToSupabase(updated, settings);
        }
      } catch (err: any) {
        showToast('error', `Excel parse error: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 4. GLOBAL RATES
  const handleSaveRates = () => {
    const updated: AppSettings = {
      ...settings,
      defaultDocumentChargePercent: docChargePct,
      defaultInterestRate: interestRate,
    };
    onUpdateSettings(updated);
    showToast('success', 'Global financial rates updated.');
  };

  // 5. SUPABASE
  const handleSaveSupabaseConfig = () => {
    const updated: AppSettings = {
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      supabaseTableName: supabaseTable.trim() || 'bikes',
      autoSyncEnabled: true,
    };
    onUpdateSettings(updated);
    showToast('success', 'Supabase credentials saved.');
  };

  const handleDownloadFromSupabase = async () => {
    if (!isOnline) {
      showToast('error', 'Device is offline. Cannot reach Supabase.');
      return;
    }
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showToast('error', 'Please configure Supabase URL and Key first.');
      return;
    }

    setIsSyncing(true);
    const temp = {
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      supabaseTableName: supabaseTable.trim() || 'bikes',
    };

    const res = await syncFromSupabase(temp);
    setIsSyncing(false);

    if (res.success && res.data) {
      onUpdateBikes(res.data);
      showToast('success', `Downloaded ${res.data.length} records from Supabase into local storage!`);
    } else {
      showToast('error', `Supabase sync error: ${res.error}`);
    }
  };

  const handleUploadToSupabase = async () => {
    if (!isOnline) {
      showToast('error', 'Device is offline. Cannot upload to Supabase.');
      return;
    }
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showToast('error', 'Please configure Supabase URL and Key first.');
      return;
    }

    setIsSyncing(true);
    const temp = {
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      supabaseTableName: supabaseTable.trim() || 'bikes',
    };

    const res = await syncToSupabase(bikes, temp);
    setIsSyncing(false);

    if (res.success) {
      showToast('success', `Uploaded ${bikes.length} records to Supabase!`);
    } else {
      showToast('error', `Upload error: ${res.error}`);
    }
  };

  // 6. COMPLETE DATABASE RESET & WIPE OPTIONS
  const handleCompleteResetToFactory = async () => {
    if (
      window.confirm(
        '⚠️ COMPLETELY RESET DATABASE?\n\nThis will delete all custom vehicle records and restored data, resetting back to the Monik Group standard factory catalog.\n\nAre you sure?'
      )
    ) {
      try {
        await onResetDefaults();
        showToast('success', 'Database reset to factory catalog defaults.');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Factory reset failed.');
      }
    }
  };

  const handleWipeAllSavedData = async () => {
    if (
      window.confirm(
        '🚨 CRITICAL ACTION: WIPE ALL SAVED DATA?\n\nThis will completely erase all 100% of vehicle records in the database (0 vehicles). You can then start fresh or upload a new Excel file.\n\nDo you want to proceed?'
      )
    ) {
      try {
        if (onWipeDatabase) {
          await onWipeDatabase();
        } else {
          onUpdateBikes([]);
        }
        showToast('info', 'All bike details have been deleted from the database.');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Database wipe failed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-lg text-xs font-bold text-white shadow-md flex items-center justify-between transition animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'info'
              ? 'bg-blue-600'
              : 'bg-[#E32636]'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* ADMIN CONTROL PANEL CONTAINER */}
      <div className="bg-slate-800 text-white rounded-xl border border-slate-700 shadow-md overflow-hidden">
        {/* TOP BAR: Title & Connectivity Badge */}
        <div className="p-5 border-b border-slate-700 bg-slate-900/60 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">
                Admin Database & Inventory Management
              </h2>
              <p className="text-xs text-slate-400">
                View & Edit data categorized by Brand & Model • Complete Database Reset • Supabase Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-700'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOnline ? 'Online (Auto-Sync Active)' : 'Offline (Local Storage)'}</span>
            </span>
          </div>
        </div>

        {/* ADMIN SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap border-b border-slate-700 bg-slate-900/40 text-xs font-bold px-4">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>View & Edit Inventory ({bikes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'excel'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Bulk Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'rates'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Global Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'supabase'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Supabase Cloud Link</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'database'
                ? 'border-rose-500 text-rose-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Reset Database Options</span>
          </button>
        </div>

        {/* TAB 1: VIEW & EDIT INVENTORY (BY BRAND & MODEL CATEGORIES) */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-5">
            {/* INVENTORY SUMMARY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
                  Total Vehicles
                </span>
                <span className="text-xl font-black text-amber-400 block mt-0.5">
                  {filteredBikes.length} of {bikes.length}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
                  Brands Active
                </span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {brands.length} Brands
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
                  Total Inventory Value
                </span>
                <span className="text-xl font-black text-emerald-400 block mt-0.5">
                  LKR {formatNumber(totalValue)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
                  Average Price
                </span>
                <span className="text-xl font-black text-slate-200 block mt-0.5">
                  LKR {formatNumber(avgPrice)}
                </span>
              </div>
            </div>

            {/* FILTER CONTROLS: BRAND, MODEL CATEGORY & SEARCH */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Filter View by Brand & Model Category:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Layout:</span>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded transition cursor-pointer ${
                      viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                    title="Full Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`p-1.5 rounded transition cursor-pointer ${
                      viewMode === 'grouped' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                    title="Grouped by Brand & Category Cards"
                  >
                    <Grid className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSaveAllEditedRows}
                    className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Brand Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-600 text-xs font-bold outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="ALL">All Brands ({bikes.length} models)</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b} ({bikes.filter((bike) => bike.brand === b).length} models)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Category Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Model Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-600 text-xs font-bold outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search query */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Search Model or Keyword
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Pulsar, Platina, 160..."
                      className="w-full pl-8 p-2 bg-slate-800 text-white rounded-lg border border-slate-600 text-xs font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VIEW MODE 1: COMPLETE INVENTORY TABLE WITH INLINE EDIT & FULL EDIT */}
            {viewMode === 'table' && (
              <div className="bg-slate-900/40 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-700 text-[11px] uppercase tracking-wider">
                        <th className="p-3">Brand</th>
                        <th className="p-3">Model</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 w-20">Year</th>
                        <th className="p-3">Selling Price (0.00)</th>
                        <th className="p-3">Downpayment (0.00)</th>
                        <th className="p-3">Facility Loan</th>
                        <th className="p-3 text-center w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredBikes.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No vehicles found matching the selected Brand and Category filters.
                          </td>
                        </tr>
                      ) : (
                        filteredBikes.map((bike) => {
                          const rowData = editedRows[bike.id] || {
                            model: bike.model,
                            year: bike.year,
                            sellingPrice: bike.sellingPrice,
                            downpayment: bike.downpayment,
                          };
                          const isRowSaved = savedRowIds[bike.id];
                          const catName = getBikeCategory(bike);

                          return (
                            <tr key={bike.id} className="hover:bg-slate-800/60 transition">
                              <td className="p-3">
                                <span className="font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                  {bike.brand}
                                </span>
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={rowData.model}
                                  onChange={(e) => handleRowChange(bike.id, 'model', e.target.value)}
                                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-white w-full outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="p-3 text-slate-400 font-medium whitespace-nowrap">
                                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                  {catName}
                                </span>
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={rowData.year}
                                  onChange={(e) => handleRowChange(bike.id, 'year', e.target.value)}
                                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-white w-16 outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={rowData.sellingPrice}
                                  onChange={(e) => handleRowChange(bike.id, 'sellingPrice', e.target.value)}
                                  placeholder="0.00"
                                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-emerald-300 w-32 outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={rowData.downpayment}
                                  onChange={(e) => handleRowChange(bike.id, 'downpayment', e.target.value)}
                                  placeholder="0.00"
                                  className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-amber-300 w-28 outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-300 whitespace-nowrap">
                                LKR {formatNumber(bike.facilityAmount)}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Save Inline Edit */}
                                  <button
                                    type="button"
                                    onClick={() => handleSaveRow(bike.id)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 ${
                                      isRowSaved
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                    title="Save changes to local database"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>{isRowSaved ? '✓ Saved!' : 'Save'}</span>
                                  </button>

                                  {/* Full Edit Modal */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFullEdit(bike)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    title="Full parameter edit (all fields)"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>Full</span>
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBike(bike.id, `${bike.brand} ${bike.model}`)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded text-xs font-bold transition cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: GROUPED BY BRAND AND MODEL CATEGORIES */}
            {viewMode === 'grouped' && (
              <div className="space-y-6">
                {Object.keys(groupedData).length === 0 ? (
                  <div className="p-8 bg-slate-900/40 rounded-xl border border-slate-700 text-center text-slate-400">
                    No vehicles found matching current filters.
                  </div>
                ) : (
                  Object.entries(groupedData).map(([brandName, catGroup]) => (
                    <div
                      key={brandName}
                      className="bg-slate-900/60 rounded-xl border border-slate-700 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-amber-400 uppercase tracking-wider">
                            Brand: {brandName}
                          </span>
                          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {Object.values(catGroup).reduce((acc, list) => acc + list.length, 0)} Models
                          </span>
                        </div>
                      </div>

                      {Object.entries(catGroup).map(([catName, bikeList]) => (
                        <div key={catName} className="space-y-2 pl-2 border-l-2 border-slate-700">
                          <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Category: {catName}</span>
                            <span className="text-[10px] text-slate-500">({bikeList.length} items)</span>
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {bikeList.map((bike) => (
                              <div
                                key={bike.id}
                                className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 space-y-2 hover:border-amber-400/50 transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h6 className="font-bold text-xs text-white">
                                      {bike.model}
                                    </h6>
                                    <p className="text-[10px] text-slate-400">
                                      {bike.year} • {bike.engineCc} CC • {bike.status || 'Available'}
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleOpenFullEdit(bike)}
                                      className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs cursor-pointer"
                                      title="Edit details"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBike(bike.id, `${bike.brand} ${bike.model}`)}
                                      className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-700/60 font-mono">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Price:</span>
                                    <span className="text-emerald-300 font-bold">LKR {formatNumber(bike.sellingPrice)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">Downpayment:</span>
                                    <span className="text-amber-300 font-bold">LKR {formatNumber(bike.downpayment)}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900 p-2 rounded text-[11px] flex justify-between items-center">
                                  <span className="text-slate-400">Facility Loan:</span>
                                  <span className="font-bold text-white">LKR {formatNumber(bike.facilityAmount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD SINGLE VEHICLE */}
        {activeTab === 'add' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Add New Vehicle to Database</span>
            </h3>
            <p className="text-xs text-slate-300">
              Create a new vehicle model with automatic categorization and 0.00 pricing calculations.
            </p>

            <form onSubmit={handleAddVehicle} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. BAJAJ, HONDA, TVS"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. PULSAR N160 DUAL ABS"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Engine Capacity (CC)</label>
                  <input
                    type="number"
                    value={newCc}
                    onChange={(e) => setNewCc(e.target.value)}
                    placeholder="160"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Downpayment (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDp}
                    onChange={(e) => setNewDp(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#E32636] hover:bg-[#C81E2B] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Vehicle to Database</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: EXCEL BULK UPLOAD */}
        {activeTab === 'excel' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Bulk Upload Vehicles via Excel (.xlsx / .csv)</span>
            </h3>
            <p className="text-xs text-slate-300">
              Columns recognized: <b>BRAND, MODEL, MAXIMUM RETAIL PRICE, DISCOUNT, Downpayment, YEAR, CC, Category</b>
            </p>

            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700 flex flex-wrap items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-lg border border-slate-600 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600"
              />
              <button
                type="button"
                onClick={handleExcelUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload & Import to Database</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL RATES */}
        {activeTab === 'rates' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Global Financing Rates & Charges</span>
            </h3>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Doc Charge %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={docChargePct}
                    onChange={(e) => setDocChargePct(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Insurance Charge (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={insuranceCharge}
                    onChange={(e) => setInsuranceCharge(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Rate (%/Year)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveRates}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Save className="w-4 h-4" />
                <span>Save Global Rates</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE CLOUD LINK & OFFLINE SYNC */}
        {activeTab === 'supabase' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-emerald-300">
                  Supabase Cloud Database Link & Offline Auto-Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline font-semibold"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              When online, the app downloads and synchronizes cloud database records with local device storage. If connectivity is lost, it continues functioning completely offline with local storage.
            </p>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Table Name</label>
                  <input
                    type="text"
                    value={supabaseTable}
                    onChange={(e) => setSupabaseTable(e.target.value)}
                    placeholder="bikes"
                    className="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Supabase Link</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFromSupabase}
                  disabled={isSyncing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
                >
                  <CloudDownload className="w-4 h-4" />
                  <span>{isSyncing ? 'Syncing...' : 'Download Online Data to Device'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUploadToSupabase}
                  disabled={isSyncing}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Upload Local Inventory to Supabase</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMPLETE DATABASE RESET OPTIONS */}
        {activeTab === 'database' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-base text-rose-400">
                Database Management & Complete Reset Options
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Manage and reset stored database records. You can restore standard Monik Group factory inventory or completely wipe all records to start fresh.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Completely Reset to Factory Catalog */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>&lt;Completely Reset Database to Factory Catalog&gt;</span>
                </div>
                <p className="text-xs text-slate-300">
                  Resets the database back to standard factory catalog defaults (Bajaj, Honda, TVS, Yamaha with all official rates and prices). All custom edits and added models will be restored to defaults.
                </p>
                <button
                  type="button"
                  onClick={handleCompleteResetToFactory}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Factory Catalog</span>
                </button>
              </div>

              {/* Option 2: Completely Wipe All Saved Data */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>&lt;Wipe All Saved Data (Clean Slate)&gt;</span>
                </div>
                <p className="text-xs text-slate-300">
                  Completely clears all stored vehicle inventory records from local device storage (0 vehicles). Ideal if you want to upload a brand-new custom inventory spreadsheet from scratch.
                </p>
                <button
                  type="button"
                  onClick={handleWipeAllSavedData}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Wipe All Saved Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED FULL EDIT MODAL */}
      <EditVehicleModal
        bike={editingBike}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveFullEdit}
        settings={settings}
      />
    </div>
  );
};
