import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calculator, Info } from 'lucide-react';
import { BikeModel, AppSettings } from '../types';
import { findRMVRatesByCc } from '../utils/calculator';

interface BikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bike: BikeModel) => void;
  initialBike?: BikeModel | null;
  settings: AppSettings;
}

export const BikeModal: React.FC<BikeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBike,
  settings,
}) => {
  const [formData, setFormData] = useState<Partial<BikeModel>>({
    brand: 'Yamaha',
    model: '',
    year: new Date().getFullYear(),
    engineCc: 150,
    sellingPrice: 120000,
    discount: 5000,
    downpayment: 30000,
    documentChargePercent: settings.defaultDocumentChargePercent || 5.0,
    insuranceCharge: 4500,
    rmvCharge: 14000,
    facilityPeriod: settings.defaultFacilityPeriod || 36,
    facilityInterestRate: settings.defaultInterestRate || 14.5,
    status: 'Available',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialBike) {
      setFormData(initialBike);
    } else {
      // Default new bike template
      const defaultSelling = 120000;
      const defaultDiscount = 5000;
      const defaultAfterDisc = defaultSelling - defaultDiscount;
      const defaultDown = 30000;
      const defaultAfterDown = defaultAfterDisc - defaultDown;
      const defaultDocPct = settings.defaultDocumentChargePercent || 5.0;
      const defaultDocCharge = (defaultAfterDisc * defaultDocPct) / 100;
      const defaultInsurance = 4800;
      const defaultRmv = findRMVRatesByCc(150, settings.rmvRates).totalRmv;
      const defaultTotalCharges = defaultDocCharge + defaultInsurance + defaultRmv;
      const defaultFacility = defaultAfterDown;

      setFormData({
        brand: 'Yamaha',
        model: '',
        year: new Date().getFullYear(),
        engineCc: 150,
        sellingPrice: defaultSelling,
        discount: defaultDiscount,
        afterDiscount: defaultAfterDisc,
        downpayment: defaultDown,
        afterDownpayment: defaultAfterDown,
        documentChargePercent: defaultDocPct,
        documentCharge: defaultDocCharge,
        insuranceCharge: defaultInsurance,
        rmvCharge: defaultRmv,
        totalCharges: defaultTotalCharges,
        facilityAmount: defaultFacility,
        facilityPeriod: settings.defaultFacilityPeriod || 36,
        facilityInterestRate: settings.defaultInterestRate || 14.5,
        status: 'Available',
      });
    }
  }, [initialBike, isOpen, settings]);

  if (!isOpen) return null;

  // Auto calculate dynamic values whenever pricing or charges change
  const handlePricingChange = (field: keyof BikeModel, value: number | string) => {
    const updated = { ...formData, [field]: value };

    const sellingPrice = Number(updated.sellingPrice) || 0;
    const discount = Number(updated.discount) || 0;
    const afterDiscount = Math.max(0, sellingPrice - discount);

    const downpayment = Number(updated.downpayment) || 0;
    const afterDownpayment = Math.max(0, afterDiscount - downpayment);

    const docPercent = Number(updated.documentChargePercent) || 5;
    // Document charge is calculated based on afterDiscount or configured
    const documentCharge = Math.round(((afterDiscount * docPercent) / 100) * 100) / 100;

    const insuranceCharge = Number(updated.insuranceCharge) || 0;
    const rmvCharge = Number(updated.rmvCharge) || 0;

    const totalCharges = documentCharge + insuranceCharge + rmvCharge;
    const facilityAmount = afterDownpayment;

    setFormData({
      ...updated,
      afterDiscount,
      afterDownpayment,
      documentCharge,
      totalCharges,
      facilityAmount,
    });
  };

  // Recalculate RMV when Engine CC changes
  const handleCcChange = (cc: number) => {
    const rmv = findRMVRatesByCc(cc, settings.rmvRates);
    const updated = { ...formData, engineCc: cc, rmvCharge: rmv.totalRmv };

    const docCharge = Number(updated.documentCharge) || 0;
    const insCharge = Number(updated.insuranceCharge) || 0;
    const totalCharges = docCharge + insCharge + rmv.totalRmv;
    const afterDown = Number(updated.afterDownpayment) || 0;

    setFormData({
      ...updated,
      totalCharges,
      facilityAmount: afterDown,
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.brand?.trim()) errs.brand = 'Brand is required';
    if (!formData.model?.trim()) errs.model = 'Model name is required';
    if (!formData.year || formData.year < 1990 || formData.year > 2030)
      errs.year = 'Enter a valid year between 1990 and 2030';
    if (!formData.sellingPrice || formData.sellingPrice <= 0)
      errs.sellingPrice = 'Selling price must be greater than 0';
    if ((formData.discount || 0) >= (formData.sellingPrice || 0))
      errs.discount = 'Discount cannot exceed selling price';
    if ((formData.downpayment || 0) < 0)
      errs.downpayment = 'Down payment cannot be negative';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalBike: BikeModel = {
      id: initialBike?.id || `bike-${Date.now()}`,
      brand: formData.brand || 'Other',
      model: formData.model || 'Unknown',
      year: Number(formData.year) || new Date().getFullYear(),
      engineCc: Number(formData.engineCc) || 150,
      sellingPrice: Number(formData.sellingPrice) || 0,
      discount: Number(formData.discount) || 0,
      afterDiscount: Number(formData.afterDiscount) || 0,
      downpayment: Number(formData.downpayment) || 0,
      afterDownpayment: Number(formData.afterDownpayment) || 0,
      documentChargePercent: Number(formData.documentChargePercent) || 5,
      documentCharge: Number(formData.documentCharge) || 0,
      insuranceCharge: Number(formData.insuranceCharge) || 0,
      rmvCharge: Number(formData.rmvCharge) || 0,
      totalCharges: Number(formData.totalCharges) || 0,
      facilityAmount: Number(formData.facilityAmount) || 0,
      facilityPeriod: Number(formData.facilityPeriod) || 36,
      facilityInterestRate: Number(formData.facilityInterestRate) || 14.5,
      status: formData.status || 'Available',
    };

    onSave(finalBike);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="bike-crud-modal"
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {initialBike ? 'Edit Bike Financing Record' : 'Add New Bike Model'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure vehicle specs, pricing, downpayment tier, and loan facilities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: Vehicle Details */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Vehicle Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Brand *</label>
                <input
                  id="bike-input-brand"
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Yamaha, Honda"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.brand && <p className="text-[11px] text-red-600 mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Model Name *</label>
                <input
                  id="bike-input-model"
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. FZ-S V3 ABS"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.model && <p className="text-[11px] text-red-600 mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Manufacture Year</label>
                <input
                  id="bike-input-year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.year && <p className="text-[11px] text-red-600 mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Engine CC</label>
                <input
                  id="bike-input-cc"
                  type="number"
                  value={formData.engineCc || ''}
                  onChange={(e) => handleCcChange(Number(e.target.value))}
                  placeholder="e.g. 150"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Auto-links RMV fees</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Pricing & Downpayment */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Pricing & Downpayment ({settings.currencySymbol})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price *</label>
                <input
                  id="bike-input-selling-price"
                  type="number"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => handlePricingChange('sellingPrice', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                />
                {errors.sellingPrice && <p className="text-[11px] text-red-600 mt-1">{errors.sellingPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount</label>
                <input
                  id="bike-input-discount"
                  type="number"
                  value={formData.discount ?? ''}
                  onChange={(e) => handlePricingChange('discount', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                />
                {errors.discount && <p className="text-[11px] text-red-600 mt-1">{errors.discount}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">After Discount</label>
                <input
                  type="number"
                  value={formData.afterDiscount || 0}
                  readOnly
                  className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed font-medium"
                />
                <span className="text-[10px] text-slate-400">Auto-calculated</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Downpayment (Min)</label>
                <input
                  id="bike-input-downpayment"
                  type="number"
                  value={formData.downpayment ?? ''}
                  onChange={(e) => handlePricingChange('downpayment', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                />
                {errors.downpayment && <p className="text-[11px] text-red-600 mt-1">{errors.downpayment}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">After Downpayment</label>
                <input
                  type="number"
                  value={formData.afterDownpayment || 0}
                  readOnly
                  className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed font-medium"
                />
                <span className="text-[10px] text-slate-400">Net capital balance</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Charges Structure */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Charges & Levies ({settings.currencySymbol})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Doc Charge (%)</label>
                <input
                  id="bike-input-doc-pct"
                  type="number"
                  step="0.1"
                  value={formData.documentChargePercent ?? 5}
                  onChange={(e) => handlePricingChange('documentChargePercent', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Doc Charge Amt</label>
                <input
                  type="number"
                  value={formData.documentCharge || 0}
                  readOnly
                  className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed font-medium"
                />
                <span className="text-[10px] text-slate-400">5% of net price</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Insurance Charge</label>
                <input
                  id="bike-input-insurance"
                  type="number"
                  value={formData.insuranceCharge ?? ''}
                  onChange={(e) => handlePricingChange('insuranceCharge', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">RMV Charge</label>
                <input
                  id="bike-input-rmv"
                  type="number"
                  value={formData.rmvCharge ?? ''}
                  onChange={(e) => handlePricingChange('rmvCharge', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Charges</label>
                <input
                  type="number"
                  value={formData.totalCharges || 0}
                  readOnly
                  className="w-full px-3 py-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-bold cursor-not-allowed"
                />
                <span className="text-[10px] text-amber-700">Doc + Ins + RMV</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Facility & Loan Details */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Facility Loan Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Final Facility Amount</label>
                <input
                  type="number"
                  value={formData.facilityAmount || 0}
                  readOnly
                  className="w-full px-3 py-1.5 text-xs bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 font-extrabold cursor-not-allowed"
                />
                <span className="text-[10px] text-indigo-600">Net capital + Total charges</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Facility Period</label>
                <select
                  id="bike-input-period"
                  value={formData.facilityPeriod || 36}
                  onChange={(e) => setFormData({ ...formData, facilityPeriod: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-900"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Interest Rate (% p.a.)</label>
                <input
                  id="bike-input-rate"
                  type="number"
                  step="0.1"
                  value={formData.facilityInterestRate ?? 14.5}
                  onChange={(e) => setFormData({ ...formData, facilityInterestRate: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inventory Status</label>
                <select
                  id="bike-input-status"
                  value={formData.status || 'Available'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                >
                  <option value="Available">Available</option>
                  <option value="Special Promo">Special Promo</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200/80 transition-colors"
            >
              Cancel
            </button>
            <button
              id="bike-save-btn"
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{initialBike ? 'Update Model' : 'Save Bike Model'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
