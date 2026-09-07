import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bike,
  BadgePercent,
  Calculator,
  MessageSquare,
  Calendar,
  Printer,
  Download,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { BikeModel, AppSettings, CalculationInputs, CalculationResult } from '../types';
import {
  generateAmortizationSchedule,
  formatCurrency,
  formatNumber,
} from '../utils/calculator';
import { exportScheduleToPDF } from '../utils/pdfGenerator';
import { Language, translations } from '../utils/i18n';

interface UserCalculatorProps {
  bikes: BikeModel[];
  settings: AppSettings;
  language: Language;
  activeTool: 'calculator' | 'schedule';
  onSelectTool: (tool: 'calculator' | 'schedule') => void;
  reloadToken: number;
}

export const UserCalculator: React.FC<UserCalculatorProps> = ({
  bikes,
  settings,
  language,
  activeTool,
  onSelectTool,
  reloadToken,
}) => {
  const t = translations[language];
  const summaryCardRef = useRef<HTMLDivElement>(null);

  // Brand & Model State
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Extract unique brands
  const availableBrands = useMemo(() => {
    return Array.from(new Set(bikes.map((b) => b.brand))).sort();
  }, [bikes]);

  // Models filtered by selected brand
  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    return bikes.filter((b) => b.brand === selectedBrand);
  }, [bikes, selectedBrand]);

  // Active selected bike
  const currentBike = useMemo(() => {
    return bikes.find((b) => b.id === selectedModelId) || null;
  }, [bikes, selectedModelId]);

  // Form Inputs
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [downpayment, setDownpayment] = useState<number>(0);
  const [docChargePct, setDocChargePct] = useState<number>(settings.defaultDocumentChargePercent || 5.0);
  const [insuranceCharge, setInsuranceCharge] = useState<number>(0);
  const [rmvCharge, setRmvCharge] = useState<number>(8500);
  const [period, setPeriod] = useState<number>(settings.defaultFacilityPeriod || 36);
  const [interestRate, setInterestRate] = useState<number>(settings.defaultInterestRate || 14.5);
  const [facilityDate, setFacilityDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const skipInitialBikeLoad = useRef(false);

  useEffect(() => {
    if (reloadToken === 0) return;
    skipInitialBikeLoad.current = true;
    setSelectedBrand('');
    setSelectedModelId('');
    setSellingPrice(0);
    setDiscount(0);
    setDownpayment(0);
    setDocChargePct(0);
    setInsuranceCharge(0);
    setRmvCharge(0);
    setPeriod(0);
    setInterestRate(0);
    setFacilityDate(new Date().toISOString().split('T')[0]);
    setCopiedNotification(null);
  }, [reloadToken]);

  // Initialize with first available bike
  useEffect(() => {
    if (skipInitialBikeLoad.current) {
      skipInitialBikeLoad.current = false;
      return;
    }
    if (bikes.length > 0 && !selectedBrand) {
      const firstBike = bikes[0];
      setSelectedBrand(firstBike.brand);
      setSelectedModelId(firstBike.id);
      applyBikeData(firstBike);
    }
  }, [bikes, selectedBrand]);

  const applyBikeData = (bike: BikeModel) => {
    setSellingPrice(bike.sellingPrice);
    setDiscount(bike.discount || 0);
    setDownpayment(bike.downpayment || 0);
    setDocChargePct(bike.documentChargePercent || settings.defaultDocumentChargePercent || 5.0);
    setInsuranceCharge(bike.insuranceCharge || 0);
    setRmvCharge(bike.rmvCharge || 8500);
    setPeriod(bike.facilityPeriod || settings.defaultFacilityPeriod || 36);
    setInterestRate(bike.facilityInterestRate || settings.defaultInterestRate || 14.5);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    if (!brand) {
      setSelectedModelId('');
      return;
    }
    const matchingBikes = bikes.filter((b) => b.brand === brand);
    if (matchingBikes.length > 0) {
      const first = matchingBikes[0];
      setSelectedModelId(first.id);
      applyBikeData(first);
    } else {
      setSelectedModelId('');
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const bike = bikes.find((b) => b.id === modelId);
    if (bike) {
      applyBikeData(bike);
    }
  };

  // Calculations matching Monik Group exact formulas with 0.00 precision
  const afterDiscount = Math.max(0, sellingPrice - discount);
  const afterDownpayment = Math.max(0, afterDiscount - downpayment);
  const docChargeAmount = Math.round(afterDownpayment * (docChargePct / 100) * 100) / 100;
  const totalCharges = Math.round((docChargeAmount + insuranceCharge + rmvCharge) * 100) / 100;

  const annualRate = Math.max(0, interestRate);
  const validPeriod = Math.max(1, period);
  const totalInterest = Math.round(
    (afterDownpayment * (annualRate / 100) / 12 * validPeriod) * 100
  ) / 100;
  const facilityAmount = Math.round((afterDownpayment + totalInterest) * 100) / 100;
  const totalRepayment = facilityAmount;
  const monthlyInstallment = validPeriod > 0 ? Math.round((facilityAmount / validPeriod) * 100) / 100 : 0;

  // Calculation object for Schedule generation
  const calculationInputs: CalculationInputs = {
    brand: selectedBrand,
    modelId: selectedModelId,
    sellingPrice,
    discount,
    afterDiscount,
    downpayment,
    customDownpayment: downpayment,
    afterDownpayment,
    documentChargePercent: docChargePct,
    documentCharge: docChargeAmount,
    insuranceCharge,
    rmvCharge,
    totalCharges,
    facilityAmount,
    facilityPeriod: validPeriod,
    facilityInterestRate: annualRate,
    releaseDate: facilityDate,
    calculationMethod: 'flat',
    includeChargesInLoan: true,
  };

  const calculationSummary: CalculationResult = {
    facilityAmount,
    monthlyInstallment,
    totalInterest,
    totalPayable: totalRepayment,
    totalCustomerOutlay: downpayment + totalRepayment,
    effectiveApr: annualRate,
  };

  const scheduleRows = useMemo(() => {
    return generateAmortizationSchedule(calculationInputs, calculationSummary);
  }, [calculationInputs, calculationSummary]);

  // Send via WhatsApp Handler
  const handleSendViaWhatsApp = async () => {
    if (summaryCardRef.current) {
      try {
        const canvas = await html2canvas(summaryCardRef.current, { scale: 2 });
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && navigator.clipboard.write) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
              setCopiedNotification('Quotation image copied to clipboard! You can paste (Ctrl+V) directly in WhatsApp.');
              setTimeout(() => setCopiedNotification(null), 5000);
            } catch (err) {
              console.warn('Clipboard write fallback', err);
            }
          }
        }, 'image/png');
      } catch (e) {
        console.warn('html2canvas render error', e);
      }
    }

    // Direct WhatsApp text link with 0.00 formatted prices
    const brandName = selectedBrand || '---';
    const modelName = currentBike ? currentBike.model : '---';
    const facilityText = `LKR ${formatNumber(facilityAmount)}`;
    const monthlyText = `LKR ${formatNumber(monthlyInstallment)}`;

    const textPayload = encodeURIComponent(
      `*MONIK GROUP - HIRE PURCHASE QUOTATION*\n\n` +
      `*Vehicle:* ${brandName} ${modelName} (${currentBike?.year || '2026'})\n` +
      `*Selling Price:* LKR ${formatNumber(sellingPrice)}\n` +
      `*Downpayment:* LKR ${formatNumber(downpayment)}\n` +
      `*Facility Amount:* ${facilityText}\n` +
      `*Period:* ${validPeriod} Months @ ${annualRate}%\n` +
      `*Monthly Installment:* ${monthlyText}\n\n` +
      `_Thank you for choosing Monik Group!_`
    );

    window.open(`https://api.whatsapp.com/send?text=${textPayload}`, '_blank');
  };

  // PDF Quote Download
  const handleDownloadPdf = () => {
    if (currentBike) {
      exportScheduleToPDF(calculationInputs, calculationSummary, scheduleRows, settings, currentBike);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-md flex items-center justify-between transition animate-fade-in">
          <span>{copiedNotification}</span>
          <button onClick={() => setCopiedNotification(null)} className="text-white hover:text-emerald-200 ml-3">
            ✕
          </button>
        </div>
      )}

      {/* 1. CALCULATION & INPUT MODULE */}
      {activeTool === 'calculator' && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: VEHICLE DETAILS */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#1B365D] border-b border-slate-200 pb-2 flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#E32636]" />
                <span>{t.vehDetails}</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.brand}</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D] cursor-pointer"
                >
                  <option value="">{t.selectBrand}</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.model}</label>
                <select
                  value={selectedModelId}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D] disabled:opacity-50 cursor-pointer"
                >
                  <option value="">{t.selectModel}</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.year}</label>
                  <select
                    disabled
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option>{currentBike?.year || 2026}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.cc}</label>
                  <input
                    type="text"
                    readOnly
                    value={currentBike?.engineCc ? `${currentBike.engineCc} CC` : '---'}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: PRICING & DOWNPAYMENT (0.00 Format) */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#1B365D] border-b border-slate-200 pb-2 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-[#E32636]" />
                <span>{t.pricingDp}</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.selling}</label>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-[#1B365D] outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.discount}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.afterDisc}</label>
                  <input
                    type="text"
                    readOnly
                    value={`LKR ${formatNumber(afterDiscount)}`}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.dp}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={downpayment || ''}
                    onChange={(e) => setDownpayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-amber-700 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.afterDp}</label>
                  <input
                    type="text"
                    readOnly
                    value={`LKR ${formatNumber(afterDownpayment)}`}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 3: CHARGES & ACTIONS (0.00 Format) */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#1B365D] border-b border-slate-200 pb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#E32636]" />
                <span>{t.chargesFac}</span>
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.docPct}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={docChargePct || ''}
                    onChange={(e) => setDocChargePct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.docAmt}</label>
                  <input
                    type="text"
                    readOnly
                    value={`LKR ${formatNumber(docChargeAmount)}`}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.insurance}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={insuranceCharge || ''}
                    onChange={(e) => setInsuranceCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.rmv}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rmvCharge || ''}
                    onChange={(e) => setRmvCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Facility Amount</label>
                <input
                  type="text"
                  readOnly
                  value={`LKR ${formatNumber(facilityAmount)}`}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.period}</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={period || ''}
                    onChange={(e) => setPeriod(Math.max(1, parseInt(e.target.value) || 12))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.interest}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate || ''}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Interest</label>
                  <input
                    type="text"
                    readOnly
                    value={`LKR ${formatNumber(totalInterest)}`}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Facility Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={`LKR ${formatNumber(facilityAmount)}`}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Facility Date</label>
                  <input
                    type="date"
                    value={facilityDate}
                    onChange={(e) => setFacilityDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
              </div>

              {/* USER ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTool('schedule')}
                  className="flex-1 bg-[#1B365D] hover:bg-[#122440] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{t.btnCalc}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.btnWhatsapp}</span>
                </button>
              </div>
            </div>
          </div>

        </>
      )}

      {(activeTool === 'calculator' || activeTool === 'schedule') && (
        <>
          {/* 2. FORMULA SUMMARY DISPLAY (14px font target with 0.00 price format) */}
          <div
            id="summary-card"
            ref={summaryCardRef}
            className="bg-[#1B365D] text-white p-6 rounded-xl shadow-md space-y-4"
          >
            <div className="border-b border-slate-600 pb-3 flex justify-between items-center">
              <span className="font-bold text-amber-400 text-base">
                {t.quotationTitle}
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[14px]">
              <div>
                <b>Vehicle:</b> {selectedBrand || '---'} - {currentBike ? currentBike.model : t.selectModel}
              </div>
              <div>
                <b>{t.selling}:</b> LKR {formatNumber(sellingPrice)}
              </div>
              <div>
                <b>{t.dp}:</b> LKR {formatNumber(downpayment)}
              </div>
              <div>
                <b>{t.docAmt}:</b> LKR {formatNumber(docChargeAmount)}
              </div>
              <div>
                <b>Insurance + RMV:</b> LKR {formatNumber(insuranceCharge + rmvCharge)}
              </div>
              <div>
                <b>Period & Rate:</b> {validPeriod} Months @ {annualRate.toFixed(2)}%
              </div>
              <div>
                <b>Expected Facility Date:</b> {facilityDate || '---'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-slate-600 pt-4">
              <div>
                <span className="text-[12px] text-slate-300 block font-semibold uppercase tracking-wider">
                  {t.dispFacility}
                </span>
                <span className="text-[20px] font-black text-amber-400 block">
                  LKR {formatNumber(facilityAmount)}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-slate-300 block font-semibold uppercase tracking-wider">
                  Total Interest Amount
                </span>
                <span className="text-[18px] font-bold text-slate-100 block">
                  LKR {formatNumber(totalInterest)}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-slate-300 block font-semibold uppercase tracking-wider">
                  {t.dispCharges}
                </span>
                <span className="text-[18px] font-bold text-slate-100 block">
                  LKR {formatNumber(totalCharges)}
                </span>
              </div>
              <div className="bg-[#E32636] p-3 rounded-lg text-center shadow">
                <span className="text-[12px] text-white uppercase font-bold tracking-wider block">
                  {t.dispMonthly}
                </span>
                <span className="text-[22px] font-black text-white block mt-0.5">
                  LKR {formatNumber(monthlyInstallment)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. AMORTIZATION SCHEDULE TOOL (0.00 Format) */}
      {activeTool === 'schedule' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentBike ? `${currentBike.brand} ${currentBike.model}` : 'Vehicle'} — {t.scheduleTab}
              </h3>
              <p className="text-xs text-slate-500">
                Facility: LKR {formatNumber(facilityAmount)} • Period: {validPeriod} Months • Rate: {annualRate.toFixed(2)}% p.a. • Start: {facilityDate || '---'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectTool('calculator')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 cursor-pointer"
              >
                ← Back to Calculator
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#122440] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#122440] text-white font-semibold sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-center">Month #</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Beginning Balance (LKR)</th>
                    <th className="px-4 py-3 text-right text-indigo-300">Principal (LKR)</th>
                    <th className="px-4 py-3 text-right text-amber-300">Interest (LKR)</th>
                    <th className="px-4 py-3 text-right text-emerald-300">Installment (LKR)</th>
                    <th className="px-4 py-3 text-right">Ending Balance (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {scheduleRows.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-center font-bold text-slate-700">{row.month}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.dueDate}</td>
                      <td className="px-4 py-2.5 text-right font-medium">LKR {formatNumber(row.beginningBalance)}</td>
                      <td className="px-4 py-2.5 text-right text-indigo-700 font-bold">LKR {formatNumber(row.principalComponent)}</td>
                      <td className="px-4 py-2.5 text-right text-amber-700 font-medium">LKR {formatNumber(row.interestComponent)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-700 font-bold">LKR {formatNumber(row.monthlyPayment)}</td>
                      <td className="px-4 py-2.5 text-right font-medium">LKR {formatNumber(row.endingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
