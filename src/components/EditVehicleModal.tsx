import React, { useState, useEffect } from 'react';
import { X, Save, Bike, Calculator, CheckCircle } from 'lucide-react';
import { BikeModel, AppSettings } from '../types';
import { CATEGORIES, getBikeCategory } from '../utils/categoryHelper';
import { formatNumber } from '../utils/calculator';

interface EditVehicleModalProps {
  bike: BikeModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBike: BikeModel) => void;
  settings: AppSettings;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  bike,
  isOpen,
  onClose,
  onSave,
  settings,
}) => {
  if (!isOpen || !bike) return null;

  const [brand, setBrand] = useState(bike.brand);
  const [model, setModel] = useState(bike.model);
  const [category, setCategory] = useState(getBikeCategory(bike));
  const [year, setYear] = useState(bike.year || 2026);
  const [engineCc, setEngineCc] = useState(bike.engineCc || 150);

  const [sellingPrice, setSellingPrice] = useState(bike.sellingPrice);
  const [discount, setDiscount] = useState(bike.discount || 0);
  const [downpayment, setDownpayment] = useState(bike.downpayment || 0);

  const [docChargePct, setDocChargePct] = useState(bike.documentChargePercent || 5.0);
  const [insuranceCharge, setInsuranceCharge] = useState(bike.insuranceCharge || 0);
  const [rmvCharge, setRmvCharge] = useState(bike.rmvCharge || 8500);

  const [facilityPeriod, setFacilityPeriod] = useState(bike.facilityPeriod || 36);
  const [facilityInterestRate, setFacilityInterestRate] = useState(bike.facilityInterestRate || 14.5);
  const [status, setStatus] = useState<BikeModel['status']>(bike.status || 'Available');

  const [isSaved, setIsSaved] = useState(false);

  // Synchronize on bike change
  useEffect(() => {
    if (bike) {
      setBrand(bike.brand);
      setModel(bike.model);
      setCategory(getBikeCategory(bike));
      setYear(bike.year || 2026);
      setEngineCc(bike.engineCc || 150);
      setSellingPrice(bike.sellingPrice);
      setDiscount(bike.discount || 0);
      setDownpayment(bike.downpayment || 0);
      setDocChargePct(bike.documentChargePercent || 5.0);
      setInsuranceCharge(bike.insuranceCharge || 0);
      setRmvCharge(bike.rmvCharge || 8500);
      setFacilityPeriod(bike.facilityPeriod || 36);
      setFacilityInterestRate(bike.facilityInterestRate || 14.5);
      setStatus(bike.status || 'Available');
      setIsSaved(false);
    }
  }, [bike]);

  // Derived Calculations
  const afterDiscount = Math.max(0, sellingPrice - discount);
  const afterDownpayment = Math.max(0, afterDiscount - downpayment);
  const docCharge = Math.round(afterDownpayment * (docChargePct / 100) * 100) / 100;
  const totalCharges = Math.round((docCharge + insuranceCharge + rmvCharge) * 100) / 100;
  const facilityAmount = Math.round(afterDownpayment * 100) / 100;

  const validPeriod = Math.max(1, facilityPeriod);
  const totalInterest = 0;
  const totalRepay = facilityAmount;
  const monthlyInstallment = validPeriod > 0 ? Math.round((facilityAmount / validPeriod) * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: BikeModel = {
      ...bike,
      brand: brand.trim().toUpperCase(),
      model: model.trim().toUpperCase(),
      category,
      year: Number(year) || 2026,
      engineCc: Number(engineCc) || 150,
      sellingPrice: Math.round(Number(sellingPrice) * 100) / 100,
      discount: Math.round(Number(discount) * 100) / 100,
      afterDiscount,
      downpayment: Math.round(Number(downpayment) * 100) / 100,
      afterDownpayment,
      documentChargePercent: Number(docChargePct) || 5.0,
      documentCharge: docCharge,
      insuranceCharge: Math.round(Number(insuranceCharge) * 100) / 100,
      rmvCharge: Math.round(Number(rmvCharge) * 100) / 100,
      totalCharges,
      facilityAmount,
      facilityPeriod: validPeriod,
      facilityInterestRate: Number(facilityInterestRate) || 14.5,
      status,
    };

    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Edit Vehicle Details
              </h3>
              <p className="text-xs text-slate-400">
                {bike.brand} - {bike.model} (ID: {bike.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Identification & Classification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              1. Brand, Model & Category Classification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Engine Capacity (CC)</label>
                <input
                  type="number"
                  value={engineCc}
                  onChange={(e) => setEngineCc(parseInt(e.target.value) || 150)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Availability Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Special Promo">Special Promo</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Pricing & Downpayment (0.00 Precision) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              2. Pricing & Downpayment (0.00 Format)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Selling Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-300 outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Discount (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Downpayment (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={downpayment}
                  onChange={(e) => setDownpayment(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-amber-300 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 3. Charges & Financing Settings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              3. Charges, Rate & Tenure
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Doc Charge %</label>
                <input
                  type="number"
                  step="0.01"
                  value={docChargePct}
                  onChange={(e) => setDocChargePct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Insurance (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={insuranceCharge}
                  onChange={(e) => setInsuranceCharge(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">RMV Charge (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rmvCharge}
                  onChange={(e) => setRmvCharge(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={facilityPeriod}
                  onChange={(e) => setFacilityPeriod(parseInt(e.target.value) || 12)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rate (%/Year)</label>
                <input
                  type="number"
                  step="0.01"
                  value={facilityInterestRate}
                  onChange={(e) => setFacilityInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Live Calculation Output Preview Card */}
          <div className="bg-[#122440] p-4 rounded-lg border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">After Downpayment:</span>
              <span className="font-bold text-slate-200">LKR {formatNumber(afterDownpayment)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Total Charges:</span>
              <span className="font-bold text-slate-200">LKR {formatNumber(totalCharges)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Facility Loan:</span>
              <span className="font-black text-amber-400">LKR {formatNumber(facilityAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Monthly Installment:</span>
              <span className="font-black text-emerald-400 text-sm">LKR {formatNumber(monthlyInstallment)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Saved to Database!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
