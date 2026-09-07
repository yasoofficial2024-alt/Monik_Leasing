import { BikeModel, AppSettings } from '../types';

export function generateStandaloneHtmlCode(bikes: BikeModel[], settings: AppSettings): string {
  const initialBikesJson = JSON.stringify(bikes, null, 2);
  const initialSettingsJson = JSON.stringify(settings, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monik Group of Companies - Hire Purchase Pro</title>
  <meta name="description" content="Vehicle Hire Purchase & AutoFinance calculator with tri-language support, WhatsApp quotation sharing, Excel bulk import, and admin configuration.">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- html2canvas for WhatsApp Card Image capture -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <!-- SheetJS for Excel (.xlsx/.xls) parsing -->
  <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
  <!-- jsPDF & AutoTable CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            monikNavy: '#1B365D',
            monikNavyDark: '#122440',
            monikRed: '#E32636',
            monikRedHover: '#C81E2B'
          }
        }
      }
    }
  </script>

  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- TOP BAR: Language Switcher & Role -->
  <div class="bg-[#122440] text-slate-200 text-xs py-2 px-4 border-b border-slate-700 no-print">
    <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-1.5">
          <i data-lucide="languages" class="w-4 h-4 text-[#E32636]"></i>
          <span class="font-semibold text-slate-400" id="lang-label">Language:</span>
          <select id="lang-select" onchange="changeLanguage()" class="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 outline-none font-bold text-xs cursor-pointer">
            <option value="en">English</option>
            <option value="si">සිංහල (Sinhala)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>

        <!-- Offline / Online Indicator -->
        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700">
          <span class="w-2 h-2 rounded-full bg-emerald-400" id="status-dot"></span>
          <span class="text-emerald-300" id="status-text">Online (Auto-sync)</span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <span class="bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]" id="role-indicator">
          User View
        </span>
        <button id="btn-role-toggle" onclick="toggleRole()" class="bg-[#E32636] hover:bg-[#C81E2B] text-white px-2.5 py-0.5 rounded text-xs font-bold transition shadow-xs cursor-pointer">
          <span id="btn-role-text">Open Admin</span>
        </button>
      </div>
    </div>
  </div>

  <!-- MAIN HEADER -->
  <header class="bg-[#1B365D] text-white shadow-lg border-b-4 border-[#E32636] no-print">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-xl shadow select-none">
          <span class="text-[#E32636]">M</span><span class="text-[#1B365D]">G</span>
        </div>
        <div>
          <h1 class="text-xl font-black tracking-wide leading-none" id="hdr-title">MONIK GROUP OF COMPANIES</h1>
          <p class="text-xs text-rose-300 font-bold tracking-wider uppercase mt-0.5" id="hdr-subtitle">CHAIRMAN OFFICE</p>
        </div>
      </div>

      <!-- User Nav Tools (Calculator / Schedule) -->
      <div id="user-tools-nav" class="flex items-center gap-2 bg-slate-900/40 p-1 rounded-lg border border-white/10 text-xs font-bold">
        <button onclick="switchUserTool('calc')" id="tool-btn-calc" class="px-3 py-1.5 rounded transition bg-[#E32636] text-white shadow-sm">
          Calculator
        </button>
        <button onclick="switchUserTool('sched')" id="tool-btn-sched" class="px-3 py-1.5 rounded transition text-slate-300 hover:text-white">
          Schedule
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTENT CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    <!-- USER VIEW -->
    <div id="view-user" class="space-y-6">

      <!-- TOOL 1: CALCULATOR & SUMMARY -->
      <div id="user-tool-calc-view" class="space-y-6">
        <!-- 3-COLUMN INPUT MODULE -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- COLUMN 1: VEHICLE DETAILS -->
          <div class="space-y-4">
            <h2 class="text-sm font-bold text-[#1B365D] border-b pb-2 flex items-center gap-2">
              <i data-lucide="bike" class="w-4 h-4 text-[#E32636]"></i>
              <span id="lbl-veh-details">Vehicle Details</span>
            </h2>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-brand">Brand</label>
              <select id="calc-brand" onchange="onBrandChange()" class="w-full border rounded-lg p-2 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D] cursor-pointer">
                <option value="">-- Select Brand --</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-model">Model</label>
              <select id="calc-model" onchange="onModelChange()" disabled class="w-full border rounded-lg p-2 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D] cursor-pointer">
                <option value="">-- Select Model --</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-year">Year</label>
                <select id="calc-year" disabled class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-700 outline-none">
                  <option>2026</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-cc">Engine CC</label>
                <input type="text" id="calc-cc" readonly placeholder="---" class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-700 outline-none">
              </div>
            </div>
          </div>

          <!-- COLUMN 2: PRICING & DOWNPAYMENT (0.00 Format) -->
          <div class="space-y-4">
            <h2 class="text-sm font-bold text-[#1B365D] border-b pb-2 flex items-center gap-2">
              <i data-lucide="badge-percent" class="w-4 h-4 text-[#E32636]"></i>
              <span id="lbl-pricing-dp">Pricing & Downpayment</span>
            </h2>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-selling">Selling Price (LKR)</label>
              <input type="number" step="0.01" id="calc-selling" oninput="calculateAll()" placeholder="0.00" class="w-full border rounded-lg p-2 text-xs font-bold text-[#1B365D] outline-none focus:ring-2 focus:ring-[#1B365D]">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-discount">Discount (LKR)</label>
                <input type="number" step="0.01" id="calc-discount" value="0.00" oninput="calculateAll()" placeholder="0.00" class="w-full border rounded-lg p-2 text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-after-disc">After Discount</label>
                <input type="text" id="disp-after-disc" readonly class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-dp">Downpayment (LKR)</label>
                <input type="number" step="0.01" id="calc-dp" oninput="calculateAll()" placeholder="0.00" class="w-full border rounded-lg p-2 text-xs font-bold text-amber-700 outline-none focus:ring-2 focus:ring-amber-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-after-dp">After Downpayment</label>
                <input type="text" id="disp-after-dp" readonly class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none">
              </div>
            </div>
          </div>

          <!-- COLUMN 3: CHARGES & ACTIONS (0.00 Format) -->
          <div class="space-y-4">
            <h2 class="text-sm font-bold text-[#1B365D] border-b pb-2 flex items-center gap-2">
              <i data-lucide="calculator" class="w-4 h-4 text-[#E32636]"></i>
              <span id="lbl-charges-fac">Charges & Facility Details</span>
            </h2>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-doc-pct">Doc Charge %</label>
                <input type="number" step="0.01" id="calc-doc-pct" oninput="calculateAll()" class="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-doc-amt">Doc Charge Amount</label>
                <input type="text" id="disp-doc-amt" readonly class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-insurance">Insurance (LKR)</label>
                <input type="number" step="0.01" id="calc-insurance" value="0.00" oninput="calculateAll()" placeholder="0.00" class="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-rmv">RMV Charges (LKR)</label>
                <input type="number" step="0.01" id="calc-rmv" value="8500.00" oninput="calculateAll()" placeholder="0.00" class="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]">
              </div>
            </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Facility Amount</label>
                <input type="text" id="disp-charge-facility-amt" readonly class="w-full border rounded-lg p-2 bg-slate-100 text-xs font-bold text-slate-800 outline-none">
              </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-period">Period (Months)</label>
                <input type="number" id="calc-period" value="36" oninput="calculateAll()" class="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1" id="lbl-interest">Interest Rate (%/Yr)</label>
                <input type="number" step="0.01" id="calc-interest" value="14.5" oninput="calculateAll()" class="w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1B365D]">
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="pt-2 flex flex-col sm:flex-row gap-2">
              <button type="button" onclick="switchUserTool('sched')" class="flex-1 bg-[#1B365D] hover:bg-[#122440] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer">
                <i data-lucide="calculator" class="w-4 h-4"></i>
                <span id="btn-calc">Calculate</span>
              </button>
              <button type="button" onclick="sendViaWhatsApp()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer">
                <i data-lucide="message-square" class="w-4 h-4"></i>
                <span id="btn-whatsapp">Send via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. FORMULA SUMMARY DISPLAY (Exact 0.00 Price Format) -->
        <div id="summary-card" class="bg-[#1B365D] text-white p-6 rounded-xl shadow-md space-y-4">
          <div class="border-b border-slate-600 pb-3 flex justify-between items-center">
            <span class="font-bold text-amber-400 text-base" id="summary-card-title">HIRE PURCHASE QUOTATION SUMMARY</span>
            <span class="text-xs text-slate-300" id="summary-card-date"></span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[14px]">
            <div id="sum-bike-info"><b>Vehicle:</b> ---</div>
            <div id="sum-selling-info"><b>Selling Price:</b> LKR 0.00</div>
            <div id="sum-dp-info"><b>Downpayment:</b> LKR 0.00</div>
            <div id="sum-doc-info"><b>Doc Charges:</b> LKR 0.00</div>
            <div id="sum-ins-info"><b>Insurance + RMV:</b> LKR 0.00</div>
            <div id="sum-period-info"><b>Period & Rate:</b> ---</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-slate-600 pt-4">
            <div>
              <span class="text-[12px] text-slate-300 block font-semibold uppercase tracking-wider" id="lbl-disp-facility">FACILITY AMOUNT</span>
              <span class="text-[20px] font-black text-amber-400 block" id="disp-facility-amt">LKR 0.00</span>
              <span class="text-[11px] text-slate-300 block mt-1">TOTAL INTEREST: <span id="disp-total-interest">LKR 0.00</span></span>
            </div>
            <div>
              <span class="text-[12px] text-slate-300 block font-semibold uppercase tracking-wider" id="lbl-disp-charges">TOTAL CHARGES</span>
              <span class="text-[18px] font-bold text-slate-100 block" id="disp-total-charges">LKR 0.00</span>
            </div>
            <div class="bg-[#E32636] p-3 rounded-lg text-center shadow">
              <span class="text-[12px] text-white uppercase font-bold tracking-wider block" id="lbl-disp-monthly">MONTHLY INSTALLMENT</span>
              <span class="text-[22px] font-black text-white block mt-0.5" id="disp-monthly-installment">LKR 0.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TOOL 2: AMORTIZATION SCHEDULE VIEW -->
      <div id="user-tool-sched-view" class="hidden space-y-5">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 class="text-base font-bold text-slate-900" id="sched-header-title">Vehicle Amortization Schedule</h3>
            <p class="text-xs text-slate-500" id="sched-header-sub">Complete month-by-month payment schedule with 0.00 precision</p>
          </div>
          <div class="flex gap-2">
            <button onclick="switchUserTool('calc')" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 cursor-pointer">
              ← Back to Calculator
            </button>
            <button onclick="window.print()" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print</span>
            </button>
            <button onclick="downloadSchedulePDF()" class="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#122440] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto max-h-[550px]">
            <table class="w-full text-xs text-left" id="schedule-table">
              <thead class="bg-[#122440] text-white font-semibold sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-center">Month #</th>
                  <th class="px-4 py-3">Due Date</th>
                  <th class="px-4 py-3 text-right">Beginning Balance</th>
                  <th class="px-4 py-3 text-right text-indigo-300">Principal</th>
                  <th class="px-4 py-3 text-right text-amber-300">Interest</th>
                  <th class="px-4 py-3 text-right text-emerald-300">Installment</th>
                  <th class="px-4 py-3 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody id="schedule-table-body" class="divide-y divide-slate-100 font-mono">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ADMIN PANEL VIEW -->
    <div id="view-admin" class="hidden space-y-6">
      <div class="bg-slate-800 text-white p-6 rounded-xl space-y-6 border border-slate-700 shadow-sm">
        <div class="flex flex-wrap justify-between items-center gap-3 border-b border-slate-700 pb-3">
          <h3 class="font-bold text-lg text-amber-400 flex items-center gap-2">
            <i data-lucide="settings" class="w-5 h-5 text-amber-400"></i>
            <span id="admin-panel-title">Admin Configuration Panel</span>
          </h3>
          <button onclick="toggleRole()" class="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded font-semibold transition cursor-pointer">
            Exit Admin Mode
          </button>
        </div>

        <!-- 1. UPDATE FINANCIAL SETTINGS -->
        <div class="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
          <h4 class="font-bold text-sm text-slate-200" id="admin-sec1-title">1. Update Financial Settings</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs mb-1 text-slate-300" id="lbl-admin-doc">Doc Charge %</label>
              <input type="number" step="0.01" id="admin-doc-pct" class="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none">
            </div>
            <div>
              <label class="block text-xs mb-1 text-slate-300" id="lbl-admin-ins">Insurance Charge (LKR)</label>
              <input type="number" step="0.01" id="admin-insurance" class="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none">
            </div>
            <div>
              <label class="block text-xs mb-1 text-slate-300" id="lbl-admin-rate">Interest Rate (%/Year)</label>
              <input type="number" step="0.01" id="admin-interest" class="w-full p-2 text-slate-900 bg-white rounded font-bold text-xs outline-none">
            </div>
          </div>
          <button onclick="saveAdminRates()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
            <i data-lucide="save" class="w-4 h-4"></i>
            <span id="btn-save-rates">Save Global Rates</span>
          </button>
        </div>

        <!-- 2. ADD NEW VEHICLE -->
        <div class="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
          <h4 class="font-bold text-sm text-slate-200" id="admin-sec2-title">2. Add New Vehicle</h4>
          <div class="grid grid-cols-2 sm:grid-cols-6 gap-2">
            <input type="text" id="admin-brand" placeholder="Brand (BAJAJ)" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
            <input type="text" id="admin-model" placeholder="Model (PULSAR N160)" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
            <input type="text" id="admin-year" placeholder="Year (2026)" value="2026" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
            <input type="text" id="admin-cc" placeholder="CC (160 CC)" value="160 CC" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
            <input type="number" step="0.01" id="admin-price" placeholder="Price (0.00)" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
            <input type="number" step="0.01" id="admin-dp" placeholder="Downpayment (0.00)" class="p-2 text-slate-900 bg-white rounded text-xs font-bold outline-none">
          </div>
          <button onclick="addSingleVehicle()" class="bg-[#E32636] hover:bg-[#C81E2B] text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span id="btn-add-veh">Add Vehicle to Database</span>
          </button>
        </div>

        <!-- 3. EXCEL BULK UPLOAD -->
        <div class="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
          <h4 class="font-bold text-sm text-slate-200" id="admin-sec3-title">3. Bulk Upload Vehicles via Excel (.xlsx / .csv)</h4>
          <p class="text-xs text-slate-400">Excel columns supported: <b>BRAND, MODEL, MAXIMUM RETAIL PRICE, DISCOUNT, Downpayment, YEAR, CC</b></p>
          <div class="flex flex-wrap items-center gap-3">
            <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" class="text-xs text-slate-300 bg-slate-800 p-2 rounded border border-slate-600">
            <button onclick="uploadExcelData()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>Upload & Sync</span>
            </button>
          </div>
        </div>

        <!-- 4. EDIT / DELETE INVENTORY BY BRAND & MODEL CATEGORIES WITH COMPLETE RESET OPTIONS -->
        <div class="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h4 class="font-bold text-sm text-slate-200" id="admin-sec4-title">4. View & Edit Inventory by Brand & Model Category</h4>
            
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="resetDataOption()" class="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="Restore factory catalog">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>&lt;Reset to Factory Catalog&gt;</span>
              </button>
              <button onclick="wipeAllDataOption()" class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="Completely clear all database saved data">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>&lt;Wipe All Saved Data&gt;</span>
              </button>
              <button onclick="promptSupabaseLink()" class="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                <i data-lucide="link" class="w-3.5 h-3.5"></i>
                <span>Supabase Link</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-[11px] text-slate-300 font-semibold mb-1">Filter by Brand:</label>
              <select id="admin-filter-brand" onchange="renderAdminTable()" class="w-full p-2 text-slate-900 bg-white rounded text-xs font-bold border border-slate-400 outline-none cursor-pointer">
                <option value="ALL">-- All Brands --</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-slate-300 font-semibold mb-1">Filter by Model Category:</label>
              <select id="admin-filter-category" onchange="renderAdminTable()" class="w-full p-2 text-slate-900 bg-white rounded text-xs font-bold border border-slate-400 outline-none cursor-pointer">
                <option value="ALL">-- All Categories --</option>
                <option value="Commuter">Commuter (100-125 CC)</option>
                <option value="Standard">Standard / Street (126-160 CC)</option>
                <option value="Sport">Sport & Performance (161-250 CC)</option>
                <option value="Superbike">Cruiser & Superbike (250+ CC)</option>
                <option value="Scooter">Scooter / Automatic</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-200 mt-2 border-collapse">
              <thead>
                <tr class="bg-slate-800 text-slate-300 border-b border-slate-600">
                  <th class="p-2">Brand</th>
                  <th class="p-2" id="th-model">Model</th>
                  <th class="p-2 w-20" id="th-year">Year</th>
                  <th class="p-2" id="th-price">Selling Price (0.00)</th>
                  <th class="p-2" id="th-dp">Downpayment (0.00)</th>
                  <th class="p-2 text-center w-36" id="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="admin-inventory-table-body" class="divide-y divide-slate-700">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-[#1B365D] flex items-center justify-center text-[#E32636] font-black text-xs">M</div>
        <span class="font-bold text-slate-700">Monik Group of Companies</span>
        <span>•</span>
        <span>Customer Hotline: <strong>011 234 5678</strong></span>
      </div>
      <span>Monik Group AutoFinance Engine • Fully Offline Capable with Local Storage Sync</span>
    </div>
  </footer>

  <!-- JAVASCRIPT LOGIC ENGINE -->
  <script>
    // Initial Database (Saved to and synced from localStorage)
    const STORAGE_KEY_BIKES = 'monik_standalone_bikes_v2';
    const STORAGE_KEY_SETTINGS = 'monik_standalone_settings_v2';

    let BIKES_DATABASE = JSON.parse(localStorage.getItem(STORAGE_KEY_BIKES) || '${JSON.stringify(bikes).replace(/'/g, "\\'")}');
    let APP_SETTINGS = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '${JSON.stringify(settings).replace(/'/g, "\\'")}');
    let currentRole = 'user';
    let currentLanguage = 'en';
    let currentUserTool = 'calc';

    // Helper: format numbers to 0.00
    function formatNumber2(val) {
      const num = parseFloat(val) || 0;
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY_BIKES, JSON.stringify(BIKES_DATABASE));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(APP_SETTINGS));
    }

    // Tri-language dictionary
    const TRANSLATIONS = {
      en: {
        langLbl: "Language:",
        roleUser: "User View",
        roleAdmin: "Admin View",
        btnAdminLogin: "Open Admin",
        btnAdminExit: "Close Admin",
        hdrTitle: "MONIK GROUP OF COMPANIES",
        hdrSub: "CHAIRMAN OFFICE",
        vehDetails: "Vehicle Details",
        brand: "Brand",
        model: "Model",
        year: "Year",
        cc: "Engine CC",
        pricingDp: "Pricing & Downpayment",
        selling: "Selling Price (LKR)",
        discount: "Discount (LKR)",
        afterDisc: "After Discount",
        dp: "Downpayment (LKR)",
        afterDp: "After Downpayment",
        chargesFac: "Charges & Facility Details",
        docPct: "Doc Charge %",
        docAmt: "Doc Charge Amount",
        insurance: "Insurance (LKR)",
        rmv: "RMV Charges (LKR)",
        period: "Period (Months)",
        interest: "Interest Rate (%/Yr)",
        btnCalc: "Calculate",
        btnWhatsapp: "Send via WhatsApp",
        quotationTitle: "HIRE PURCHASE QUOTATION SUMMARY",
        dispFacility: "FACILITY AMOUNT",
        dispCharges: "TOTAL CHARGES",
        dispMonthly: "MONTHLY INSTALLMENT",
        scheduleTab: "Schedule",
        adminTitle: "Admin Configuration Panel",
        adminSec1: "1. Update Financial Settings",
        btnSaveRates: "Save Global Rates",
        adminSec2: "2. Add New Vehicle",
        btnAddVeh: "Add Vehicle to Database",
        adminSec3: "3. Bulk Upload Vehicles via Excel (.xlsx / .csv)",
        adminSec4: "4. Edit / Delete Inventory by Brand",
        thModel: "Model",
        thYear: "Year",
        thPrice: "Selling Price (LKR)",
        thDp: "Downpayment (LKR)",
        thActions: "Actions"
      },
      si: {
        langLbl: "භාෂාව:",
        roleUser: "පාරිභෝගික දැක්ම",
        roleAdmin: "පරිපාලක දැක්ම",
        btnAdminLogin: "පරිපාලක ඇතුල්වීම",
        btnAdminExit: "පරිපාලකයෙන් පිටවීම",
        hdrTitle: "මොනික් සමාගම් සමූහය",
        hdrSub: "CHAIRMAN OFFICE",
        vehDetails: "වාහන විස්තර",
        brand: "වෙළඳ නාමය (Brand)",
        model: "මාදිලිය (Model)",
        year: "වර්ෂය",
        cc: "එන්ජින් ධාරිතාව (CC)",
        pricingDp: "මිල සහ මූලික ගෙවීම",
        selling: "විකුණුම් මිල (රු.)",
        discount: "වට්ටම (රු.)",
        afterDisc: "වට්ටමෙන් පසු",
        dp: "මූලික ගෙවීම (රු.)",
        afterDp: "මූලික ගෙවීමෙන් පසු",
        chargesFac: "ගාස්තු සහ ණය විස්තර",
        docPct: "ලේඛන ගාස්තු %",
        docAmt: "ලේඛන ගාස්තු මුදල",
        insurance: "රක්ෂණ ගාස්තු (රු.)",
        rmv: "මෝටර් රථ දෙපාර්තමේන්තු ගාස්තු (රු.)",
        period: "කාලසීමාව (මාස)",
        interest: "පොලී අනුපාතය (%/වසර)",
        btnCalc: "ගණනය කරන්න",
        btnWhatsapp: "WhatsApp මගින් යවන්න",
        quotationTitle: "කුලී සින්නක්කර මිල ගණන් සාරාංශය",
        dispFacility: "ණය මුදල (Facility)",
        dispCharges: "මුළු අමතර ගාස්තු",
        dispMonthly: "මාසික වාරිකය",
        scheduleTab: "වාරික කාලසටහන",
        adminTitle: "පරිපාලක පාලක පුවරුව",
        adminSec1: "1. මූල්‍ය සැකසුම් යාවත්කාලීන කිරීම",
        btnSaveRates: "පොදු අනුපාත සුරකින්න",
        adminSec2: "2. නව වාහනයක් ඇතුළත් කිරීම",
        btnAddVeh: "දත්ත පද්ධතියට එක් කරන්න",
        adminSec3: "3. Excel ගොනුවකින් තොග දත්ත එක් කරන්න",
        adminSec4: "4. මාදිලි සංස්කරණය / මකාදැමීම",
        thModel: "මාදිලිය",
        thYear: "වර්ෂය",
        thPrice: "විකුණුම් මිල",
        thDp: "මූලික ගෙවීම",
        thActions: "ක්‍රියාමාර්ග"
      },
      ta: {
        langLbl: "மொழி:",
        roleUser: "பயனர் பார்வை",
        roleAdmin: "நிர்வாக பார்வை",
        btnAdminLogin: "நிர்வாகி உள்நுழைவு",
        btnAdminExit: "நிர்வாகியிலிருந்து வெளியேறு",
        hdrTitle: "மோனிக் குரூப் ஆஃப் கம்பெனிஸ்",
        hdrSub: "CHAIRMAN OFFICE",
        vehDetails: "வாகன விவரங்கள்",
        brand: "பிராண்ட்",
        model: "மாதிரி (Model)",
        year: "ஆண்டு",
        cc: "எஞ்சின் சிசி (CC)",
        pricingDp: "விலை மற்றும் முன்பணம்",
        selling: "விற்பனை விலை (ரூ.)",
        discount: "தள்ளுபடி (ரூ.)",
        afterDisc: "தள்ளுபடிக்கு பின்",
        dp: "முன்பணம் (ரூ.)",
        afterDp: "முன்பணத்திற்கு பின்",
        chargesFac: "கட்டணங்கள் மற்றும் தவணை விவரங்கள்",
        docPct: "ஆவண கட்டணம் %",
        docAmt: "ஆவண கட்டண தொகை",
        insurance: "காப்பீடு கட்டணம் (ரூ.)",
        rmv: "RMV கட்டணங்கள் (ரூ.)",
        period: "காலம் (மாதங்கள்)",
        interest: "வட்டி விகிதம் (%/ஆண்டு)",
        btnCalc: "கணக்கிடுங்கள்",
        btnWhatsapp: "WhatsApp மூலம் பகிர்க",
        quotationTitle: "தவணை கொள்முதல் விலை சுருக்கம்",
        dispFacility: "கடன் தொகை (Facility)",
        dispCharges: "மொத்த கட்டணங்கள்",
        dispMonthly: "மாத தவணை தொகை",
        scheduleTab: "தவணை அட்டவணை",
        adminTitle: "நிர்வாக கட்டமைப்பு குழு",
        adminSec1: "1. நிதி அமைப்புகளை புதுப்பிக்கவும்",
        btnSaveRates: "விகிதங்களை சேமிக்கவும்",
        adminSec2: "2. புதிய வாகனத்தை சேர்க்கவும்",
        btnAddVeh: "தரவுத்தளத்தில் சேர்க்கவும்",
        adminSec3: "3. எக்செல் மூலம் மொத்தமாக பதிவேற்றவும்",
        adminSec4: "4. வாகன விவரங்களை திருத்த / நீக்க",
        thModel: "மாதிரி",
        thYear: "ஆண்டு",
        thPrice: "விற்பனை விலை",
        thDp: "முன்பணம்",
        thActions: "செயல்கள்"
      }
    };

    // Role switching
    function toggleRole() {
      if (currentRole === 'user') {
        const pwd = prompt("Enter Admin Password (default: admin):");
        if (pwd === (APP_SETTINGS.adminPasswordHash || 'admin')) {
          currentRole = 'admin';
        } else if (pwd !== null) {
          alert("Incorrect password!");
          return;
        } else {
          return;
        }
      } else {
        currentRole = 'user';
      }
      applyRoleView();
    }

    function applyRoleView() {
      const userView = document.getElementById('view-user');
      const adminView = document.getElementById('view-admin');
      const roleInd = document.getElementById('role-indicator');
      const btnRoleText = document.getElementById('btn-role-text');
      const t = TRANSLATIONS[currentLanguage];

      if (currentRole === 'admin') {
        userView.classList.add('hidden');
        adminView.classList.remove('hidden');
        roleInd.innerText = t.roleAdmin;
        btnRoleText.innerText = t.btnAdminExit;
      } else {
        userView.classList.remove('hidden');
        adminView.classList.add('hidden');
        roleInd.innerText = t.roleUser;
        btnRoleText.innerText = t.btnAdminLogin;
      }
      lucide.createIcons();
    }

    // User tool switching: Calculator & Schedule
    function switchUserTool(tool) {
      currentUserTool = tool;
      document.getElementById('user-tool-calc-view').classList.toggle('hidden', tool !== 'calc');
      document.getElementById('user-tool-sched-view').classList.toggle('hidden', tool !== 'sched');

      const btnCalc = document.getElementById('tool-btn-calc');
      const btnSched = document.getElementById('tool-btn-sched');

      btnCalc.className = tool === 'calc' ? 'px-3 py-1.5 rounded transition bg-[#E32636] text-white shadow-sm' : 'px-3 py-1.5 rounded transition text-slate-300 hover:text-white';
      btnSched.className = tool === 'sched' ? 'px-3 py-1.5 rounded transition bg-[#E32636] text-white shadow-sm' : 'px-3 py-1.5 rounded transition text-slate-300 hover:text-white';

      if (tool === 'sched') renderScheduleTable();
      lucide.createIcons();
    }

    // Language changing
    function changeLanguage() {
      currentLanguage = document.getElementById('lang-select').value;
      const t = TRANSLATIONS[currentLanguage];

      document.getElementById('hdr-title').innerText = t.hdrTitle;
      document.getElementById('hdr-subtitle').innerText = t.hdrSub;
      document.getElementById('role-indicator').innerText = currentRole === 'user' ? t.roleUser : t.roleAdmin;
      document.getElementById('btn-role-text').innerText = currentRole === 'user' ? t.btnAdminLogin : t.btnAdminExit;
      document.getElementById('lbl-veh-details').innerText = t.vehDetails;
      document.getElementById('lbl-brand').innerText = t.brand;
      document.getElementById('lbl-model').innerText = t.model;
      document.getElementById('lbl-year').innerText = t.year;
      document.getElementById('lbl-cc').innerText = t.cc;
      document.getElementById('lbl-pricing-dp').innerText = t.pricingDp;
      document.getElementById('lbl-selling').innerText = t.selling;
      document.getElementById('lbl-discount').innerText = t.discount;
      document.getElementById('lbl-after-disc').innerText = t.afterDisc;
      document.getElementById('lbl-dp').innerText = t.dp;
      document.getElementById('lbl-after-dp').innerText = t.afterDp;
      document.getElementById('lbl-charges-fac').innerText = t.chargesFac;
      document.getElementById('lbl-doc-pct').innerText = t.docPct;
      document.getElementById('lbl-doc-amt').innerText = t.docAmt;
      document.getElementById('lbl-insurance').innerText = t.insurance;
      document.getElementById('lbl-rmv').innerText = t.rmv;
      document.getElementById('lbl-period').innerText = t.period;
      document.getElementById('lbl-interest').innerText = t.interest;
      document.getElementById('btn-calc').innerText = t.btnCalc;
      document.getElementById('btn-whatsapp').innerText = t.btnWhatsapp;
      document.getElementById('summary-card-title').innerText = t.quotationTitle;
      document.getElementById('lbl-disp-facility').innerText = t.dispFacility;
      document.getElementById('lbl-disp-charges').innerText = t.dispCharges;
      document.getElementById('lbl-disp-monthly').innerText = t.dispMonthly;

      document.getElementById('admin-panel-title').innerText = t.adminTitle;
      document.getElementById('admin-sec1-title').innerText = t.adminSec1;
      document.getElementById('btn-save-rates').innerText = t.btnSaveRates;
      document.getElementById('admin-sec2-title').innerText = t.adminSec2;
      document.getElementById('btn-add-veh').innerText = t.btnAddVeh;
      document.getElementById('admin-sec3-title').innerText = t.adminSec3;
      document.getElementById('admin-sec4-title').innerText = t.adminSec4;
      document.getElementById('th-model').innerText = t.thModel;
      document.getElementById('th-year').innerText = t.thYear;
      document.getElementById('th-price').innerText = t.thPrice;
      document.getElementById('th-dp').innerText = t.thDp;
      document.getElementById('th-actions').innerText = t.thActions;
    }

    // Populate Brands
    function populateBrandsDropdown() {
      const brandSelect = document.getElementById('calc-brand');
      const uniqueBrands = [...new Set(BIKES_DATABASE.map(b => b.brand))].sort();
      brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
      uniqueBrands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.innerText = b;
        brandSelect.appendChild(opt);
      });

      if (uniqueBrands.length > 0) {
        brandSelect.value = uniqueBrands[0];
        onBrandChange();
      }
    }

    function onBrandChange() {
      const brand = document.getElementById('calc-brand').value;
      const modelSelect = document.getElementById('calc-model');
      if (!brand) {
        modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
        modelSelect.disabled = true;
        return;
      }

      const models = BIKES_DATABASE.filter(b => b.brand === brand);
      modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.innerText = m.model;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;

      if (models.length > 0) {
        modelSelect.value = models[0].id;
        onModelChange();
      }
    }

    function onModelChange() {
      const modelId = document.getElementById('calc-model').value;
      const bike = BIKES_DATABASE.find(b => b.id === modelId);
      if (!bike) return;

      document.getElementById('calc-year').innerHTML = '<option>' + (bike.year || 2026) + '</option>';
      document.getElementById('calc-cc').value = (bike.engineCc || 150) + ' CC';
      document.getElementById('calc-selling').value = bike.sellingPrice.toFixed(2);
      document.getElementById('calc-discount').value = (bike.discount || 0).toFixed(2);
      document.getElementById('calc-dp').value = (bike.downpayment || 0).toFixed(2);
      document.getElementById('calc-doc-pct').value = (bike.documentChargePercent || APP_SETTINGS.defaultDocumentChargePercent || 5.0).toFixed(2);
      document.getElementById('calc-insurance').value = (bike.insuranceCharge || 0).toFixed(2);
      document.getElementById('calc-rmv').value = (bike.rmvCharge || 8500).toFixed(2);
      document.getElementById('calc-period').value = bike.facilityPeriod || APP_SETTINGS.defaultFacilityPeriod || 36;
      document.getElementById('calc-interest').value = (bike.facilityInterestRate || APP_SETTINGS.defaultInterestRate || 14.5).toFixed(2);

      calculateAll();
    }

    // Main Calculations Engine with 0.00 exact precision
    function calculateAll() {
      const selling = Math.max(0, parseFloat(document.getElementById('calc-selling').value) || 0);
      const discount = Math.max(0, parseFloat(document.getElementById('calc-discount').value) || 0);
      const afterDiscount = Math.max(0, selling - discount);
      document.getElementById('disp-after-disc').value = 'LKR ' + formatNumber2(afterDiscount);

      const dp = Math.max(0, parseFloat(document.getElementById('calc-dp').value) || 0);
      const afterDp = Math.max(0, afterDiscount - dp);
      document.getElementById('disp-after-dp').value = 'LKR ' + formatNumber2(afterDp);

      const docPct = Math.max(0, parseFloat(document.getElementById('calc-doc-pct').value) || 0);
      const docAmt = Math.round(afterDp * (docPct / 100) * 100) / 100;
      document.getElementById('disp-doc-amt').value = 'LKR ' + formatNumber2(docAmt);

      const insurance = Math.max(0, parseFloat(document.getElementById('calc-insurance').value) || 0);
      const rmv = Math.max(0, parseFloat(document.getElementById('calc-rmv').value) || 0);
      const totalCharges = Math.round((docAmt + insurance + rmv) * 100) / 100;
      const period = Math.max(1, parseInt(document.getElementById('calc-period').value) || 12);
      const interestRate = Math.max(0, parseFloat(document.getElementById('calc-interest').value) || 0);

      const totalInterest = Math.round((afterDp * (interestRate / 100) * (period / 12)) * 100) / 100;
      const facilityAmount = Math.round((afterDp + totalInterest) * 100) / 100;
      document.getElementById('disp-charge-facility-amt').value = 'LKR ' + formatNumber2(facilityAmount);
      const monthly = period > 0 ? Math.round((facilityAmount / period) * 100) / 100 : 0;

      // Update Summary Card with 0.00 precision
      const brand = document.getElementById('calc-brand').value || '---';
      const modelSelect = document.getElementById('calc-model');
      const modelText = modelSelect.options[modelSelect.selectedIndex]?.text || '---';

      document.getElementById('sum-bike-info').innerHTML = '<b>Vehicle:</b> ' + brand + ' ' + modelText;
      document.getElementById('sum-selling-info').innerHTML = '<b>Selling Price:</b> LKR ' + formatNumber2(selling);
      document.getElementById('sum-dp-info').innerHTML = '<b>Downpayment:</b> LKR ' + formatNumber2(dp);
      document.getElementById('sum-doc-info').innerHTML = '<b>Doc Charges:</b> LKR ' + formatNumber2(docAmt);
      document.getElementById('sum-ins-info').innerHTML = '<b>Insurance + RMV:</b> LKR ' + formatNumber2(insurance + rmv);
      document.getElementById('sum-period-info').innerHTML = '<b>Period & Rate:</b> ' + period + ' Months @ ' + interestRate.toFixed(2) + '%';

      document.getElementById('disp-facility-amt').innerText = 'LKR ' + formatNumber2(facilityAmount);
      document.getElementById('disp-total-interest').innerText = 'LKR ' + formatNumber2(totalInterest);
      document.getElementById('disp-total-charges').innerText = 'LKR ' + formatNumber2(totalCharges);
      document.getElementById('disp-monthly-installment').innerText = 'LKR ' + formatNumber2(monthly);
    }

    // Send via WhatsApp
    async function sendViaWhatsApp() {
      calculateAll();
      const card = document.getElementById('summary-card');

      try {
        const canvas = await html2canvas(card, { scale: 2 });
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && navigator.clipboard.write) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert("Quotation image copied to clipboard! You can paste (Ctrl+V) directly in WhatsApp.");
            } catch(e) {
              console.log("Clipboard fallback");
            }
          }
        }, 'image/png');
      } catch(err) {
        console.warn("html2canvas capture error", err);
      }

      const brand = document.getElementById('calc-brand').value || '---';
      const modelSelect = document.getElementById('calc-model');
      const model = modelSelect.options[modelSelect.selectedIndex]?.text || '---';
      const facility = document.getElementById('disp-facility-amt').innerText;
      const monthly = document.getElementById('disp-monthly-installment').innerText;
      const period = document.getElementById('calc-period').value;

      const textPayload = encodeURIComponent(
        "*MONIK GROUP - HIRE PURCHASE QUOTATION*\\n\\n" +
        "*Vehicle:* " + brand + " " + model + "\\n" +
        "*Facility Amount:* " + facility + "\\n" +
        "*Period:* " + period + " Months\\n" +
        "*Monthly Installment:* " + monthly + "\\n\\n" +
        "_Thank you for choosing Monik Group!_"
      );

      window.open('https://api.whatsapp.com/send?text=' + textPayload, '_blank');
    }

    // Amortization Schedule
    function renderScheduleTable() {
      calculateAll();
      const facility = parseFloat(document.getElementById('disp-facility-amt').innerText.replace(/[^0-9.-]+/g, "")) || 0;
      const period = parseInt(document.getElementById('calc-period').value) || 12;
      const interestRate = parseFloat(document.getElementById('calc-interest').value) || 0;

      const tbody = document.getElementById('schedule-table-body');
      tbody.innerHTML = '';

      let balance = facility;
      const monthlyPrincipal = facility / period;
      const totalInterest = facility - (facility / (1 + (interestRate / 100) * (period / 12)));
      const monthlyInterest = totalInterest / period;
      const monthlyPayment = facility / period;

      const now = new Date();
      for (let i = 1; i <= period; i++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() + i, now.getDate());
        const ending = Math.max(0, balance - monthlyPrincipal);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50';
        tr.innerHTML = \`
          <td class="px-4 py-2 text-center font-bold text-slate-700">\${i}</td>
          <td class="px-4 py-2 text-slate-600">\${dueDate.toLocaleDateString('en-GB')}</td>
          <td class="px-4 py-2 text-right">LKR \${formatNumber2(balance)}</td>
          <td class="px-4 py-2 text-right text-indigo-700 font-bold">LKR \${formatNumber2(monthlyPrincipal)}</td>
          <td class="px-4 py-2 text-right text-amber-700">LKR \${formatNumber2(monthlyInterest)}</td>
          <td class="px-4 py-2 text-right text-emerald-700 font-bold">LKR \${formatNumber2(monthlyPayment)}</td>
          <td class="px-4 py-2 text-right">LKR \${formatNumber2(ending)}</td>
        \`;
        tbody.appendChild(tr);
        balance = ending;
      }
    }

    function downloadSchedulePDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Monik Group of Companies - Payment Schedule", 14, 15);
      doc.setFontSize(10);
      doc.text("Facility: " + document.getElementById('disp-facility-amt').innerText + " | Installment: " + document.getElementById('disp-monthly-installment').innerText, 14, 22);

      doc.autoTable({
        html: '#schedule-table',
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [27, 54, 93] }
      });
      doc.save("monik_group_payment_schedule.pdf");
    }

    // ADMIN FUNCTIONS
    function saveAdminRates() {
      const docPct = parseFloat(document.getElementById('admin-doc-pct').value) || 0;
      const rate = parseFloat(document.getElementById('admin-interest').value) || 0;
      const ins = parseFloat(document.getElementById('admin-insurance').value) || 0;
      APP_SETTINGS.defaultDocumentChargePercent = docPct;
      APP_SETTINGS.defaultInterestRate = rate;
      saveToLocalStorage();
      alert("Global rates updated successfully!");
    }

    function addSingleVehicle() {
      const brand = document.getElementById('admin-brand').value.trim().toUpperCase();
      const model = document.getElementById('admin-model').value.trim().toUpperCase();
      const year = parseInt(document.getElementById('admin-year').value) || 2026;
      const cc = parseInt(document.getElementById('admin-cc').value) || 150;
      const price = parseFloat(document.getElementById('admin-price').value) || 0;
      const dp = parseFloat(document.getElementById('admin-dp').value) || 0;

      if (!brand || !model || !price) {
        alert("Please specify Brand, Model, and Price.");
        return;
      }

      const docPct = APP_SETTINGS.defaultDocumentChargePercent || 5.0;
      const docCharge = Math.round(price * (docPct / 100) * 100) / 100;

      const newBike = {
        id: "bike-" + Date.now(),
        brand: brand,
        model: model,
        year: year,
        engineCc: cc,
        sellingPrice: price,
        discount: 0,
        afterDiscount: price,
        downpayment: dp,
        afterDownpayment: Math.max(0, price - dp),
        documentChargePercent: docPct,
        documentCharge: docCharge,
        insuranceCharge: 0,
        rmvCharge: 8500,
        totalCharges: docCharge + 8500,
        facilityAmount: Math.max(0, price - dp),
        facilityPeriod: 36,
        facilityInterestRate: APP_SETTINGS.defaultInterestRate || 14.5,
        status: 'Available'
      };

      BIKES_DATABASE.unshift(newBike);
      saveToLocalStorage();
      populateBrandsDropdown();
      populateAdminBrandsDropdown();
      alert("Vehicle added to database!");
    }

    function uploadExcelData() {
      const fileInput = document.getElementById('excel-file-input');
      const file = fileInput.files[0];
      if (!file) {
        alert("Please select an Excel file first.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet);

          if (json.length === 0) {
            alert("No rows found in Excel sheet.");
            return;
          }

          const docPct = APP_SETTINGS.defaultDocumentChargePercent || 5.0;
          const imported = json.map((row, idx) => {
            const brand = (row.BRAND || row.Brand || 'BAJAJ').toString().toUpperCase().trim();
            const model = (row.MODEL || row.Model || 'MODEL-' + (idx+1)).toString().toUpperCase().trim();
            const year = parseInt(row.YEAR || row.Year || 2026) || 2026;
            const cc = parseInt(row.CC || 150) || 150;
            const price = parseFloat(row['MAXIMUM RETAIL PRICE'] || row.SellingPrice || row.PRICE || 0);
            const discount = parseFloat(row.DISCOUNT || row.Discount || 0);
            const dp = parseFloat(row.Downpayment || row.DOWNPAYMENT || 0);
            const afterDiscount = Math.max(0, price - discount);
            const afterDp = Math.max(0, afterDiscount - dp);
            const docCharge = Math.round(afterDiscount * (docPct / 100) * 100) / 100;

            return {
              id: "excel-" + Date.now() + "-" + idx,
              brand: brand,
              model: model,
              year: year,
              engineCc: cc,
              sellingPrice: price,
              discount: discount,
              afterDiscount: afterDiscount,
              downpayment: dp,
              afterDownpayment: afterDp,
              documentChargePercent: docPct,
              documentCharge: docCharge,
              insuranceCharge: 0,
              rmvCharge: 8500,
              totalCharges: docCharge + 8500,
              facilityAmount: afterDp,
              facilityPeriod: 36,
              facilityInterestRate: APP_SETTINGS.defaultInterestRate || 14.5,
              status: 'Available'
            };
          });

          BIKES_DATABASE = imported.concat(BIKES_DATABASE);
          saveToLocalStorage();
          populateBrandsDropdown();
          populateAdminBrandsDropdown();
          alert("Imported " + imported.length + " vehicles from Excel!");
          fileInput.value = '';
        } catch(err) {
          alert("Error parsing Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function populateAdminBrandsDropdown() {
      const select = document.getElementById('admin-filter-brand');
      const unique = [...new Set(BIKES_DATABASE.map(b => b.brand))].sort();
      select.innerHTML = '<option value="ALL">-- All Brands (' + BIKES_DATABASE.length + ' vehicles) --</option>';
      unique.forEach(b => {
        const count = BIKES_DATABASE.filter(bike => bike.brand === b).length;
        const opt = document.createElement('option');
        opt.value = b;
        opt.innerText = b + ' (' + count + ' models)';
        select.appendChild(opt);
      });
    }

    function getBikeCatStandalone(bike) {
      if (bike.category) return bike.category;
      const m = (bike.model || '').toUpperCase();
      if (m.includes('SCOOTER') || m.includes('DIO') || m.includes('ACTIVA') || m.includes('NTORQ') || m.includes('RAY')) {
        return 'Scooter';
      }
      const cc = bike.engineCc || 150;
      if (cc <= 125) return 'Commuter';
      if (cc <= 160) return 'Standard';
      if (cc <= 250) return 'Sport';
      return 'Superbike';
    }

    function renderAdminTable() {
      const brand = document.getElementById('admin-filter-brand').value;
      const cat = document.getElementById('admin-filter-category').value;
      const tbody = document.getElementById('admin-inventory-table-body');
      tbody.innerHTML = '';

      let filtered = BIKES_DATABASE;
      if (brand && brand !== 'ALL') {
        filtered = filtered.filter(b => b.brand === brand);
      }
      if (cat && cat !== 'ALL') {
        filtered = filtered.filter(b => getBikeCatStandalone(b) === cat);
      }

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">No vehicles match selected Brand and Model Category.</td></tr>';
        return;
      }

      filtered.forEach(bike => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-600 hover:bg-slate-800/50';
        tr.innerHTML = \`
          <td class="p-2"><span class="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold">\${bike.brand}</span></td>
          <td class="p-2"><input id="edit-model-\${bike.id}" type="text" value="\${bike.model}" class="p-1 bg-slate-900 border border-slate-600 rounded text-xs font-bold text-white w-full"></td>
          <td class="p-2"><input id="edit-year-\${bike.id}" type="number" value="\${bike.year || 2026}" class="p-1 bg-slate-900 border border-slate-600 rounded text-xs font-bold text-white w-16"></td>
          <td class="p-2"><input id="edit-price-\${bike.id}" type="number" step="0.01" value="\${bike.sellingPrice}" class="p-1 bg-slate-900 border border-slate-600 rounded text-xs font-bold text-emerald-300 w-32"></td>
          <td class="p-2"><input id="edit-dp-\${bike.id}" type="number" step="0.01" value="\${bike.downpayment}" class="p-1 bg-slate-900 border border-slate-600 rounded text-xs font-bold text-amber-300 w-28"></td>
          <td class="p-2 text-center">
            <div class="flex items-center justify-center gap-2">
              <button id="btn-save-\${bike.id}" onclick="saveAdminRow('\${bike.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                Save
              </button>
              <button onclick="deleteAdminRow('\${bike.id}')" class="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-xs font-bold transition cursor-pointer">
                ✕
              </button>
            </div>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // Save Row after edit with feedback
    function saveAdminRow(id) {
      const bike = BIKES_DATABASE.find(b => b.id === id);
      if (!bike) return;

      bike.model = document.getElementById('edit-model-' + id).value.toUpperCase();
      bike.year = parseInt(document.getElementById('edit-year-' + id).value) || 2026;
      bike.sellingPrice = parseFloat(document.getElementById('edit-price-' + id).value) || 0;
      bike.downpayment = parseFloat(document.getElementById('edit-dp-' + id).value) || 0;
      bike.afterDiscount = bike.sellingPrice;
      bike.afterDownpayment = Math.max(0, bike.sellingPrice - bike.downpayment);
      bike.documentCharge = Math.round(bike.sellingPrice * ((bike.documentChargePercent || 5.0) / 100) * 100) / 100;
      bike.facilityAmount = bike.afterDownpayment;

      saveToLocalStorage();

      const btn = document.getElementById('btn-save-' + id);
      if (btn) {
        btn.innerText = '✓ Saved!';
        btn.classList.add('bg-emerald-800');
        setTimeout(() => {
          btn.innerText = 'Save';
          btn.classList.remove('bg-emerald-800');
        }, 2000);
      }
    }

    function deleteAdminRow(id) {
      if (confirm("Delete this vehicle?")) {
        BIKES_DATABASE = BIKES_DATABASE.filter(b => b.id !== id);
        saveToLocalStorage();
        renderAdminTable();
        populateBrandsDropdown();
        populateAdminBrandsDropdown();
      }
    }

    // Completely Reset to Factory Catalog
    function resetDataOption() {
      if (confirm("Completely reset database back to standard factory catalog defaults?")) {
        localStorage.removeItem(STORAGE_KEY_BIKES);
        localStorage.removeItem(STORAGE_KEY_SETTINGS);
        location.reload();
      }
    }

    // Completely Wipe All Saved Data (0 records)
    function wipeAllDataOption() {
      if (confirm("CRITICAL: Completely wipe all saved vehicle records from database (0 vehicles)?")) {
        BIKES_DATABASE = [];
        saveToLocalStorage();
        renderAdminTable();
        populateBrandsDropdown();
        populateAdminBrandsDropdown();
        alert("All database records have been wiped (0 vehicles).");
      }
    }

    // Supabase Link in Standalone HTML
    function promptSupabaseLink() {
      const currentUrl = APP_SETTINGS.supabaseUrl || '';
      const url = prompt("Enter your Supabase Project URL (e.g. https://xyz.supabase.co):", currentUrl);
      if (url !== null) {
        APP_SETTINGS.supabaseUrl = url;
        const key = prompt("Enter Supabase Anon Key:", APP_SETTINGS.supabaseAnonKey || '');
        if (key !== null) {
          APP_SETTINGS.supabaseAnonKey = key;
          saveToLocalStorage();
          alert("Supabase credentials saved for offline & cloud synchronization.");
        }
      }
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      document.getElementById('summary-card-date').innerText = new Date().toLocaleDateString('en-GB');
      populateBrandsDropdown();
      populateAdminBrandsDropdown();
      lucide.createIcons();

      // Monitor online/offline
      window.addEventListener('online', () => {
        document.getElementById('status-dot').className = 'w-2 h-2 rounded-full bg-emerald-400';
        document.getElementById('status-text').innerText = 'Online (Auto-sync)';
      });
      window.addEventListener('offline', () => {
        document.getElementById('status-dot').className = 'w-2 h-2 rounded-full bg-amber-400';
        document.getElementById('status-text').innerText = 'Offline (Local Cache)';
      });
    });
  </script>
</body>
</html>`;
}
