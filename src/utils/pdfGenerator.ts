import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationInputs, CalculationResult, AmortizationRow, AppSettings } from '../types';
import { formatCurrency } from './calculator';

export function exportScheduleToPDF(
  inputs: CalculationInputs,
  summary: CalculationResult,
  schedule: AmortizationRow[],
  settings: AppSettings,
  selectedBikeDetails?: { brand: string; model: string; year: number; engineCc?: number }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = settings.currencySymbol || 'Rs.';

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.companyName || 'VEHICLE FINANCING & LEASING', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Official Installment Quotation & Amortization Schedule', 14, 22);

  // Date and Reference on right
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Issue Date: ${today}`, 196, 14, { align: 'right' });
  doc.text(`Doc Ref: QUO-${Date.now().toString().slice(-6)}`, 196, 20, { align: 'right' });
  doc.text(`Hotline: ${settings.contactNumber}`, 196, 26, { align: 'right' });

  let yPos = 40;

  // Vehicle Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Vehicle & Applicant Details', 14, yPos);

  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, yPos, 196, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const vehicleName = selectedBikeDetails
    ? `${selectedBikeDetails.brand} ${selectedBikeDetails.model} (${selectedBikeDetails.year})`
    : `${inputs.brand || 'Custom Vehicle'}`;
  const engine = selectedBikeDetails?.engineCc ? `${selectedBikeDetails.engineCc} CC` : 'N/A';

  doc.text(`Vehicle: ${vehicleName}`, 14, yPos);
  doc.text(`Engine Capacity: ${engine}`, 110, yPos);

  yPos += 5;
  doc.text(`Calculation Method: ${inputs.calculationMethod === 'reducing' ? 'Reducing Balance (Standard EMI)' : 'Flat Rate Microfinance'}`, 14, yPos);
  doc.text(`Release Date: ${inputs.releaseDate || 'Immediate'}`, 110, yPos);

  // Financial Breakdown Box
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Financial Summary & Key Figures', 14, yPos);

  yPos += 3;
  doc.line(14, yPos, 196, yPos);

  yPos += 6;

  // 4 Highlight Metric Cards in PDF
  const cardWidth = 42;
  const cardHeight = 22;
  const startX = 14;
  const spacing = 6;

  // Monthly Installment (Card 1)
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.roundedRect(startX, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('MONTHLY INSTALLMENT', startX + 3, yPos + 6);
  doc.setFontSize(10.5);
  doc.text(formatCurrency(summary.monthlyInstallment, currency), startX + 3, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`for ${inputs.facilityPeriod} months`, startX + 3, yPos + 19);

  // Facility Amount (Card 2)
  const c2X = startX + cardWidth + spacing;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(c2X, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('LOAN FACILITY', c2X + 3, yPos + 6);
  doc.setFontSize(10.5);
  doc.text(formatCurrency(summary.facilityAmount, currency), c2X + 3, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rate: ${inputs.facilityInterestRate}% p.a.`, c2X + 3, yPos + 19);

  // Down Payment (Card 3)
  const c3X = c2X + cardWidth + spacing;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(c3X, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('DOWN PAYMENT', c3X + 3, yPos + 6);
  doc.setFontSize(10.5);
  doc.text(formatCurrency(inputs.customDownpayment, currency), c3X + 3, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Min: ${formatCurrency(inputs.downpayment, currency)}`, c3X + 3, yPos + 19);

  // Total Payable (Card 4)
  const c4X = c3X + cardWidth + spacing;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(c44X(c4X), yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL PAYABLE', c4X + 3, yPos + 6);
  doc.setFontSize(10.5);
  doc.text(formatCurrency(summary.totalPayable, currency), c4X + 3, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Interest: ${formatCurrency(summary.totalInterest, currency)}`, c4X + 3, yPos + 19);

  yPos += cardHeight + 8;

  // Detailed Fee Structure mini-table
  const feeRows = [
    ['Vehicle Selling Price', formatCurrency(inputs.sellingPrice, currency), 'Down Payment Paid', formatCurrency(inputs.customDownpayment, currency)],
    ['Promotional Discount', `-${formatCurrency(inputs.discount, currency)}`, 'Document Charge (5%)', formatCurrency(inputs.documentCharge, currency)],
    ['Price After Discount', formatCurrency(inputs.afterDiscount, currency), 'Insurance Premium', formatCurrency(inputs.insuranceCharge, currency)],
    ['Net Capital Balance', formatCurrency(inputs.afterDownpayment, currency), 'RMV & Registration Fees', formatCurrency(inputs.rmvCharge, currency)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: feeRows,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
  });

  // Amortization Schedule Table
  // @ts-expect-error - lastAutoTable is injected by jspdf-autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : yPos + 35;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Detailed Amortization Repayment Schedule', 14, finalY);

  const scheduleTableBody = schedule.map((row) => [
    `#${row.month}`,
    row.dueDate,
    formatCurrency(row.beginningBalance, currency),
    formatCurrency(row.principalComponent, currency),
    formatCurrency(row.interestComponent, currency),
    formatCurrency(row.monthlyPayment, currency),
    formatCurrency(row.endingBalance, currency),
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Month', 'Due Date', 'Beginning Balance', 'Principal', 'Interest', 'Installment', 'Ending Balance']],
    body: scheduleTableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      halign: 'right',
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 26 },
      2: { cellWidth: 27 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 28, fontStyle: 'bold', textColor: [67, 56, 202] },
      6: { cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Apex Motor Financing System • Page ${data.pageNumber} of ${pageCount} • Subject to financial credit underwriting approval.`,
        14,
        290
      );
    },
  });

  const fileName = `Vehicle_Loan_Quotation_${inputs.brand || 'Bike'}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(fileName);
}

function c44X(val: number) {
  return val;
}
