import { CalculationInputs, CalculationResult, AmortizationRow, RMVRates } from '../types';

export function calculateFacilitySummary(inputs: CalculationInputs): CalculationResult {
  const P = Math.max(0, inputs.facilityAmount);
  const annualRate = Math.max(0, inputs.facilityInterestRate);
  const n = Math.max(1, inputs.facilityPeriod);

  let monthlyInstallment = 0;
  let totalInterest = 0;
  let totalPayable = 0;

  if (P === 0) {
    return {
      facilityAmount: 0,
      monthlyInstallment: 0,
      totalInterest: 0,
      totalPayable: 0,
      totalCustomerOutlay: inputs.customDownpayment + (inputs.includeChargesInLoan ? 0 : inputs.totalCharges),
      effectiveApr: annualRate,
    };
  }

  if (inputs.calculationMethod === 'reducing') {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) {
      monthlyInstallment = P / n;
      totalInterest = 0;
      totalPayable = P;
    } else {
      const factor = Math.pow(1 + monthlyRate, n);
      monthlyInstallment = (P * monthlyRate * factor) / (factor - 1);
      totalPayable = monthlyInstallment * n;
      totalInterest = totalPayable - P;
    }
  } else {
    // The installment is the facility amount spread across the selected period.
    totalPayable = P;
    monthlyInstallment = P / n;
  }

  const totalCustomerOutlay = inputs.customDownpayment + totalPayable + (inputs.includeChargesInLoan ? 0 : inputs.totalCharges);

  return {
    facilityAmount: Math.round(P * 100) / 100,
    monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    totalCustomerOutlay: Math.round(totalCustomerOutlay * 100) / 100,
    effectiveApr: annualRate,
  };
}

export function generateAmortizationSchedule(
  inputs: CalculationInputs,
  summary: CalculationResult
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const P = inputs.facilityAmount;
  const n = inputs.facilityPeriod;
  const annualRate = inputs.facilityInterestRate;
  const monthlyRate = annualRate / 100 / 12;

  let currentBalance = P;
  const startDate = inputs.releaseDate ? new Date(inputs.releaseDate) : new Date();

  for (let m = 1; m <= n; m++) {
    // Calculate due date: 1 month per installment
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + m);
    const dateString = dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let interestComp = 0;
    let principalComp = 0;
    let payment = summary.monthlyInstallment;
    let endBalance = 0;

    if (inputs.calculationMethod === 'reducing') {
      interestComp = currentBalance * monthlyRate;
      principalComp = payment - interestComp;

      // Handle final month rounding
      if (m === n || principalComp > currentBalance) {
        principalComp = currentBalance;
        payment = principalComp + interestComp;
        endBalance = 0;
      } else {
        endBalance = Math.max(0, currentBalance - principalComp);
      }
    } else {
      principalComp = P / n;
      payment = principalComp;
      if (m === n) {
        endBalance = 0;
      } else {
        endBalance = Math.max(0, currentBalance - principalComp);
      }
    }

    schedule.push({
      month: m,
      dueDate: dateString,
      beginningBalance: Math.round(currentBalance * 100) / 100,
      principalComponent: Math.round(principalComp * 100) / 100,
      interestComponent: Math.round(interestComp * 100) / 100,
      monthlyPayment: Math.round(payment * 100) / 100,
      endingBalance: Math.round(endBalance * 100) / 100,
    });

    currentBalance = endBalance;
  }

  return schedule;
}

export function findRMVRatesByCc(cc: number, ratesList: RMVRates[]): RMVRates {
  const match = ratesList.find((r) => cc >= r.minCc && cc <= r.maxCc);
  return (
    match ||
    ratesList[ratesList.length - 1] || {
      id: 'default',
      ccRange: 'General Standard',
      minCc: 0,
      maxCc: 9999,
      registrationFee: 6500,
      ownershipTransferFee: 2000,
      revenueLicenseFee: 2500,
      numberPlateFee: 2200,
      stampDuty: 800,
      totalRmv: 14000,
    }
  );
}

export function formatCurrency(amount: number, symbol: string = 'Rs.'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol} 0.00`;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
