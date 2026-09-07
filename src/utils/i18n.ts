export type Language = 'en' | 'si' | 'ta';

export interface TranslationDict {
  langLbl: string;
  roleUser: string;
  roleAdmin: string;
  btnAdminLogin: string;
  btnAdminExit: string;
  hdrTitle: string;
  hdrSub: string;
  vehDetails: string;
  brand: string;
  model: string;
  year: string;
  cc: string;
  pricingDp: string;
  selling: string;
  discount: string;
  afterDisc: string;
  dp: string;
  afterDp: string;
  chargesFac: string;
  docPct: string;
  docAmt: string;
  insurance: string;
  rmv: string;
  period: string;
  interest: string;
  btnCalc: string;
  btnWhatsapp: string;
  dispFacility: string;
  dispCharges: string;
  dispMonthly: string;
  adminTitle: string;
  adminSec1: string;
  adminSec2: string;
  adminSec3: string;
  adminSec4: string;
  btnSaveRates: string;
  btnAddVeh: string;
  thModel: string;
  thYear: string;
  thPrice: string;
  thDp: string;
  thActions: string;
  quotationTitle: string;
  exportHtml: string;
  scheduleTab: string;
  rmvTab: string;
  selectBrand: string;
  selectModel: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    langLbl: "Language:",
    roleUser: "User View",
    roleAdmin: "Admin View",
    btnAdminLogin: "Open Admin",
    btnAdminExit: "Close Admin",
    hdrTitle: "MONIK GROUP OF COMPANIES",
    hdrSub: "LEASING & HIREPURCHASE",
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
    insurance: "Insurance Charge",
    rmv: "RMV Charges",
    period: "Facility Period (Mos)",
    interest: "Interest Rate (%/Yr)",
    btnCalc: "Calculate",
    btnWhatsapp: "Send via WhatsApp",
    dispFacility: "Facility Amount",
    dispCharges: "Total Charges",
    dispMonthly: "Monthly Installment",
    adminTitle: "Admin Configuration Panel (Supabase & Local Synced)",
    adminSec1: "1. Update Financial Settings",
    adminSec2: "2. Add New Vehicle",
    adminSec3: "3. Bulk Upload Vehicles via Excel (.xlsx / .csv)",
    adminSec4: "4. Edit / Delete Inventory by Brand",
    btnSaveRates: "Save Global Rates",
    btnAddVeh: "Add Vehicle to Database",
    thModel: "Model",
    thYear: "Year",
    thPrice: "Selling Price (LKR)",
    thDp: "Downpayment (LKR)",
    thActions: "Actions",
    quotationTitle: "Monik Group - Hire Purchase Quotation",
    exportHtml: "Standalone HTML Export",
    scheduleTab: "Amortization Schedule",
    rmvTab: "RMV Charge Calculator",
    selectBrand: "-- Select Brand --",
    selectModel: "-- Select Model --",
  },
  si: {
    langLbl: "භාෂාව:",
    roleUser: "පරිශීලක දසුන",
    roleAdmin: "පරිපාලක දසුන",
    btnAdminLogin: "ඇතුල් වන්න",
    btnAdminExit: "පිටවන්න",
    hdrTitle: "මොනික් සමාගම් සමූහය",
    hdrSub: "LEASING & HIREPURCHASE",
    vehDetails: "වාහනයේ තොරතුරු",
    brand: "වර්ගය (Brand)",
    model: "මාදිලිය (Model)",
    year: "නිෂ්පාදිත වර්ෂය",
    cc: "එන්ජින් ධාරිතාව (CC)",
    pricingDp: "මිල ගණන් සහ මූලික ගෙවීම",
    selling: "විකුණුම් මිල (රු.)",
    discount: "වට්ටම් (රු.)",
    afterDisc: "වට්ටමෙන් පසු මිල",
    dp: "මූලික ගෙවීම (රු.)",
    afterDp: "මූලික ගෙවීමෙන් පසු",
    chargesFac: "ගාස්තු සහ පහසුකම් තොරතුරු",
    docPct: "ලේඛන ගාස්තු %",
    docAmt: "ලේඛන ගාස්තුව (රු.)",
    insurance: "රක්ෂණ ගාස්තුව",
    rmv: "RMV ගාස්තු",
    period: "කාලසීමාව (මාස)",
    interest: "පොලී අනුපාතිකය (%/වසර)",
    btnCalc: "ගණනය කරන්න",
    btnWhatsapp: "WhatsApp මගින් යවන්න",
    dispFacility: "පහසුකම් ප්‍රමාණය",
    dispCharges: "මුළු ගාස්තු එකතුව",
    dispMonthly: "මාතාන්තිර වාරිකය",
    adminTitle: "පරිපාලක පාලන පුවරුව",
    adminSec1: "1. මූල්‍ය அமைப்புகள் යාවත්කාලීන කිරීම",
    adminSec2: "2. අලුත් වාහනයක් ඇතුළත් කිරීම",
    adminSec3: "3. Excel ගොනුව මගින් ඇතුළත් කිරීම",
    adminSec4: "4. තොරතුරු වෙනස් කිරීම / ඉවත් කිරීම",
    btnSaveRates: "ගාස්තු සුරකින්න (Save)",
    btnAddVeh: "වාහනය ඇතුළත් කරන්න",
    thModel: "මාදිලිය",
    thYear: "වර්ෂය",
    thPrice: "විකුණුම් මිල",
    thDp: "මූලික ගෙවීම",
    thActions: "ක්‍රියාමාර්ග",
    quotationTitle: "මොනික් සමූහය - කල්බදු මිල ගණන් පත්‍රිකාව",
    exportHtml: "තනි HTML ගොනුව බාගන්න",
    scheduleTab: "වාරික ගෙවීම් කාලසටහන",
    rmvTab: "RMV ගාස්තු විස්තරය",
    selectBrand: "-- වර්ගය තෝරන්න --",
    selectModel: "-- මාදිලිය තෝරන්න --",
  },
  ta: {
    langLbl: "மொழி:",
    roleUser: "பயனாளர் பார்வை",
    roleAdmin: "நிர்வாகி பார்வை",
    btnAdminLogin: "உள்நுழைய",
    btnAdminExit: "வெளியேற",
    hdrTitle: "மோனிக் குழும நிறுவனங்கள்",
    hdrSub: "LEASING & HIREPURCHASE",
    vehDetails: "வாகன விபரங்கள்",
    brand: "தயாரிப்பு (Brand)",
    model: "மாடல் (Model)",
    year: "ஆண்டு",
    cc: "எஞ்சின் CC",
    pricingDp: "விலை & முன்பணம்",
    selling: "விற்பனை விலை (LKR)",
    discount: "தள்ளுபடி (LKR)",
    afterDisc: "தள்ளுபடிக்குப் பின்",
    dp: "முன்பணம் (LKR)",
    afterDp: "முன்பணத்திற்குப் பின்",
    chargesFac: "கட்டணங்கள் & வசதி விபரங்கள்",
    docPct: "ஆவணக் கட்டணம் %",
    docAmt: "ஆவணக் கட்டணத் தொகை",
    insurance: "காப்பீட்டுக் கட்டணம்",
    rmv: "RMV கட்டணங்கள்",
    period: "கால அளவு (மாதங்கள்)",
    interest: "வட்டி வீதம் (%/ஆண்டு)",
    btnCalc: "கணக்கிடுக",
    btnWhatsapp: "WhatsApp வழியே அனுப்புக",
    dispFacility: "வசதித் தொகை",
    dispCharges: "மொத்தக் கட்டணங்கள்",
    dispMonthly: "மாதாந்திர தவணை",
    adminTitle: "நிர்வாகக் கட்டுப்பாட்டுப் பலகை",
    adminSec1: "1. நிதி அமைப்புகளைப் புதுப்பிக்க",
    adminSec2: "2. புதிய வாகனத்தைச் சேர்க்க",
    adminSec3: "3. Excel வழியே பதிவேற்ற",
    adminSec4: "4. விபரங்களைத் திருத்த / நீக்க",
    btnSaveRates: "சேமிக்க (Save Rates)",
    btnAddVeh: "வாகனத்தைச் சேர்க்க",
    thModel: "மாடல்",
    thYear: "ஆண்டு",
    thPrice: "விற்பனை விலை",
    thDp: "முன்பணம்",
    thActions: "நடவடிக்கைகள்",
    quotationTitle: "மோனிக் குழுமம் - வாடகை கொள்முதல் விலைப்புள்ளி",
    exportHtml: "தனி HTML கோப்பாக ஏற்றுமதி",
    scheduleTab: "தவணை அட்டவணை",
    rmvTab: "RMV கட்டண விபரம்",
    selectBrand: "-- தயாரிப்பைத் தேர்வுசெய்க --",
    selectModel: "-- மாடலைத் தேர்வுசெய்க --",
  }
};
