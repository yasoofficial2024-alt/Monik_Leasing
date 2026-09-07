export interface BikeModel {
  id: string;
  // Vehicle Details
  brand: string;
  model: string;
  year: number;
  engineCc: number;
  imageUrl?: string;

  // Pricing & Downpayment
  sellingPrice: number;
  discount: number;
  afterDiscount: number; // sellingPrice - discount
  downpayment: number;   // minimum required downpayment
  afterDownpayment: number; // afterDiscount - downpayment

  // Charges
  documentChargePercent: number; // e.g. 5%
  documentCharge: number;        // calculated or fixed (sellingPrice or facility * %)
  insuranceCharge: number;
  rmvCharge: number;
  totalCharges: number;          // documentCharge + insuranceCharge + rmvCharge

  // Facility Details
  facilityAmount: number;        // same as afterDownpayment
  facilityPeriod: number;        // in months (e.g. 12, 24, 36, 48, 60)
  facilityInterestRate: number;  // annual percentage e.g. 14.5%
  status?: 'Available' | 'Low Stock' | 'Special Promo';
  category?: string; // e.g. 'Commuter (100-125 CC)', 'Standard (126-160 CC)', 'Sport (161-250 CC)', 'Performance (250+ CC)'
}

export interface RMVRates {
  id: string;
  ccRange: string;
  minCc: number;
  maxCc: number;
  registrationFee: number;
  ownershipTransferFee: number;
  revenueLicenseFee: number;
  numberPlateFee: number;
  stampDuty: number;
  totalRmv: number;
}

export interface AppSettings {
  defaultInterestRate: number;
  defaultDocumentChargePercent: number;
  defaultFacilityPeriod: number;
  currencySymbol: string;
  adminPasswordHash: string; // stored hashed/plain in localStorage
  calculationMethod: 'reducing' | 'flat'; // Reducing balance vs Flat rate
  includeChargesInLoan: boolean; // whether totalCharges are added to facility loan or paid upfront
  companyName: string;
  contactNumber: string;
  rmvRates: RMVRates[];
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseTableName?: string;
  autoSyncEnabled?: boolean;
}

export interface CalculationInputs {
  brand: string;
  modelId: string;
  sellingPrice: number;
  discount: number;
  afterDiscount: number;
  downpayment: number;
  customDownpayment: number;
  afterDownpayment: number;
  documentChargePercent: number;
  documentCharge: number;
  insuranceCharge: number;
  rmvCharge: number;
  totalCharges: number;
  facilityAmount: number;
  facilityPeriod: number;
  facilityInterestRate: number;
  releaseDate: string; // YYYY-MM-DD
  calculationMethod: 'reducing' | 'flat';
  includeChargesInLoan: boolean;
}

export interface CalculationResult {
  facilityAmount: number;
  monthlyInstallment: number;
  totalInterest: number;
  totalPayable: number;
  totalCustomerOutlay: number; // Downpayment + Total payments + upfront charges if not financed
  effectiveApr: number;
}

export interface AmortizationRow {
  month: number;
  dueDate: string;
  beginningBalance: number;
  principalComponent: number;
  interestComponent: number;
  monthlyPayment: number;
  endingBalance: number;
}
