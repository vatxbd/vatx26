import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Briefcase, 
  Printer, 
  Calculator, 
  Info, 
  CheckCircle2, 
  FileText,
  Scale
} from "lucide-react";

interface AreaPreset {
  id: string;
  name: string;
  cccRate: number;
  pwdType: "pakkaMain" | "pakkaBranch" | "semiPakka" | "kacha";
}

// Unified mapping for Year -> Area Presets & PWD base rates
const YEAR_DATA: Record<
  string, 
  {
    presets: AreaPreset[];
    pwdRates: { pakkaMain: number; pakkaBranch: number; semiPakka: number; kacha: number };
  }
> = {
  "2020": {
    pwdRates: { pakkaMain: 30, pakkaBranch: 23, semiPakka: 14, kacha: 9 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 12, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 8, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, চকবাজার)", cccRate: 30, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 6, pwdType: "semiPakka" },
    ],
  },
  "2021": {
    pwdRates: { pakkaMain: 31, pakkaBranch: 24, semiPakka: 15, kacha: 9 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 14, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 9, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, চকবাজার)", cccRate: 35, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 6, pwdType: "semiPakka" },
    ],
  },
  "2022": {
    pwdRates: { pakkaMain: 32, pakkaBranch: 25, semiPakka: 16, kacha: 10 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 22, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 13, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 60, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 8, pwdType: "semiPakka" },
    ],
  },
  "2023": {
    pwdRates: { pakkaMain: 32, pakkaBranch: 25, semiPakka: 16, kacha: 10 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 23, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 14, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 65, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 9, pwdType: "semiPakka" },
    ],
  },
  "2024": {
    pwdRates: { pakkaMain: 34, pakkaBranch: 26, semiPakka: 17, kacha: 11 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 24, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 15, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 70, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 9, pwdType: "semiPakka" },
    ],
  },
  "2025": {
    pwdRates: { pakkaMain: 35, pakkaBranch: 27, semiPakka: 18, kacha: 12 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 25, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 16, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 75, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 10, pwdType: "semiPakka" },
    ],
  },
  "2026": {
    pwdRates: { pakkaMain: 35, pakkaBranch: 27, semiPakka: 18, kacha: 12 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 25, pwdType: "pakkaBranch" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 16, pwdType: "pakkaBranch" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 75, pwdType: "pakkaMain" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 10, pwdType: "semiPakka" },
    ],
  },
};

export default function CtgUnifiedTaxCalculator() {
  // --- Single Unified Input State ---
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("res_posh");
  const [unitSize, setUnitSize] = useState<number>(1200);
  const [totalFlats, setTotalFlats] = useState<number>(6);
  const [selfOccupiedFlats, setSelfOccupiedFlats] = useState<number>(1);

  // Optional Overrides / Toggles
  const [customCccRate, setCustomCccRate] = useState<number>(25);
  const [applyPwdTenPercent, setApplyPwdTenPercent] = useState<boolean>(true);

  // Update CCC rate when year or area preset changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const presets = YEAR_DATA[year]?.presets || YEAR_DATA["2026"].presets;
    const currentPreset = presets.find((p) => p.id === selectedAreaId) || presets[0];
    setSelectedAreaId(currentPreset.id);
    setCustomCccRate(currentPreset.cccRate);
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const presets = YEAR_DATA[selectedYear]?.presets || YEAR_DATA["2026"].presets;
    const currentPreset = presets.find((p) => p.id === areaId);
    if (currentPreset) {
      setCustomCccRate(currentPreset.cccRate);
    }
  };

  // --- Combined Computation Engine ---
  const calculation = useMemo(() => {
    const safeSelfFlats = Math.min(selfOccupiedFlats, totalFlats);
    const rentedFlats = Math.max(0, totalFlats - safeSelfFlats);
    const totalArea = unitSize * totalFlats;
    const rentedArea = unitSize * rentedFlats;
    const selfArea = unitSize * safeSelfFlats;

    // 1. CHITTAGONG CITY CORPORATION (CCC) CALCULATION
    const cccRentedMonthly = rentedArea * customCccRate;
    const cccSelfMonthly = selfArea * customCccRate;
    const cccTotalMonthly = cccRentedMonthly + cccSelfMonthly;

    // Statutory 2 months repair deduction (x 10 months)
    const cccRentedAnnualARV = cccRentedMonthly * 10;
    const cccSelfAnnualRaw = cccSelfMonthly * 10;
    // 40% residential self-occupancy rebate
    const cccSelfRebateAmount = cccSelfAnnualRaw * 0.4;
    const cccSelfAnnualARV = cccSelfAnnualRaw - cccSelfRebateAmount;

    const cccNetARV = cccRentedAnnualARV + cccSelfAnnualARV;

    // 17% breakdown: 7% holding, 7% conservancy, 3% lighting
    const cccHolding = Math.round(cccNetARV * 0.07);
    const cccConservancy = Math.round(cccNetARV * 0.07);
    const cccLighting = Math.round(cccNetARV * 0.03);
    const cccTotalAnnualTax = cccHolding + cccConservancy + cccLighting;
    const cccQuarterly = Math.round(cccTotalAnnualTax / 4);

    // 2. PUBLIC WORKS DEPARTMENT (PWD / গণপূর্ত) CALCULATION
    const currentYearData = YEAR_DATA[selectedYear] || YEAR_DATA["2026"];
    const currentPreset = currentYearData.presets.find((p) => p.id === selectedAreaId) || currentYearData.presets[0];
    const pwdBaseRate = currentYearData.pwdRates[currentPreset.pwdType] || 25;
    const pwdEffectiveRate = applyPwdTenPercent ? Number((pwdBaseRate * 1.1).toFixed(2)) : pwdBaseRate;

    // PWD government office rent applied to rentable space
    const pwdMonthlyRent = Math.round(rentedArea * pwdEffectiveRate);
    const pwdAnnualRent = pwdMonthlyRent * 12;
    const pwdVat = Math.round(pwdMonthlyRent * 0.15); // 15% VAT
    const pwdTds = Math.round(pwdMonthlyRent * 0.05); // 5% Source Tax (u/s 53A)
    const pwdNetPayableToOwner = pwdMonthlyRent - pwdTds;

    return {
      totalArea,
      rentedArea,
      selfArea,
      rentedFlats,
      safeSelfFlats,
      // CCC
      cccRate: customCccRate,
      cccTotalMonthly,
      cccNetARV,
      cccHolding,
      cccConservancy,
      cccLighting,
      cccTotalAnnualTax,
      cccQuarterly,
      // PWD
      pwdBaseRate,
      pwdEffectiveRate,
      pwdMonthlyRent,
      pwdAnnualRent,
      pwdVat,
      pwdTds,
      pwdNetPayableToOwner,
      pwdTypeLabel: currentPreset.pwdType,
    };
  }, [selectedYear, selectedAreaId, unitSize, totalFlats, selfOccupiedFlats, customCccRate, applyPwdTenPercent]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900 rounded-2xl shadow-sm border border-slate-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> vatx.bd Unified Tax Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            চট্টগ্রাম মহানগরী সমন্বিত কর ও অফিস ভাড়া ক্যালকুলেটর
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            একক ইনপুটে চসিক হোল্ডিং ট্যাক্স (ট্যাক্সেশন রুলস ১৯৮৬) ও গণপূর্ত অফিস ভাড়ার স্বয়ংক্রিয় দ্বৈত হিসাব
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-slate-500" /> প্রিন্ট / সেভ PDF
        </button>
      </div>

      {/* SINGLE INPUT SECTION */}
      <div className="mt-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calculator className="w-5 h-5 text-emerald-600" />
          ভবন ও হোল্ডিংয়ের প্রাথমিক বিবরণ (একক ইনপুট)
        </h2>

        {/* Row 1: Year & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">প্রযোজ্য বছর</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {Object.keys(YEAR_DATA).map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === "2022" ? "(চসিক পুনর্মূল্যায়ন কার্যকর)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">এলাকা ও কাঠামোগত জোন</label>
            <select
              value={selectedAreaId}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {YEAR_DATA[selectedYear]?.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} (চসিক: ৳ {preset.cccRate}/ব.ফু.)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Flat Multipliers */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রতি ফ্ল্যাটের সাইজ (বর্গফুট)</label>
              <input
                type="number"
                value={unitSize}
                onChange={(e) => setUnitSize(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোট ফ্ল্যাট/ইউনিট সংখ্যা</label>
              <input
                type="number"
                value={totalFlats}
                onChange={(e) => setTotalFlats(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">মালিক নিজে থাকেন (ফ্ল্যাট)</label>
              <input
                type="number"
                value={selfOccupiedFlats}
                max={totalFlats}
                min={0}
                onChange={(e) => setSelfOccupiedFlats(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-emerald-400 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-emerald-200/60 pt-3 gap-2">
            <span>
              মোট বিল্ট-আপ ক্ষেত্রফল: <strong className="text-slate-900">{calculation.totalArea.toLocaleString()} বর্গফুট</strong>
            </span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-emerald-200/70 text-emerald-900 rounded-md font-medium">
                মালিকের বসবাস: {calculation.safeSelfFlats} টি ({calculation.selfArea.toLocaleString()} ব.ফু.)
              </span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md font-medium">
                ভাড়াযোগ্য স্পেস: {calculation.rentedFlats} টি ({calculation.rentedArea.toLocaleString()} ব.ফু.)
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Adjustable parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              চসিক প্রতি বর্গফুট রেট পরিবর্তন (ঐচ্ছিক কাস্টম রেট)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={customCccRate}
                onChange={(e) => setCustomCccRate(Number(e.target.value))}
                className="w-28 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500">টাকা / বর্গফুট</span>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer mt-3 sm:mt-0">
              <input
                type="checkbox"
                checked={applyPwdTenPercent}
                onChange={(e) => setApplyPwdTenPercent(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-slate-700 font-medium">
                গণপূর্তে প্রশাসনিক মন্ত্রণালয়ের সর্বোচ্চ <strong>১০% বর্ধিত হার</strong> প্রয়োগ করুন
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* DUAL RESULTS: SIDE-BY-SIDE OUTPUT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* CARD 1: CCC Holding Tax Output */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-5">
          <div>
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">চট্টগ্রাম সিটি কর্পোরেশন (চসিক)</h3>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                গৃহকর (হোল্ডিং ট্যাক্স)
              </span>
            </div>

            <div className="mt-4 flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">বার্ষিক সর্বমোট প্রদেয় কর</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  ৳ {calculation.cccTotalAnnualTax.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">প্রতি ৩ মাসের কিস্তি</span>
                <div className="text-base font-bold text-slate-200 mt-0.5">
                  ৳ {calculation.cccQuarterly.toLocaleString()}
                </div>
              </div>
            </div>

            {/* CCC Breakdown */}
            <div className="space-y-1.5 text-xs mt-4 pt-3 border-t border-slate-700/80">
              <div className="flex justify-between text-slate-300">
                <span>সম্ভাব্য মাসিক মোট ভাড়া (ARV ভ্যালু):</span>
                <span className="font-semibold text-white">৳ {calculation.cccTotalMonthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>২ মাস মেরামত ছাড় বাদে নিট ARV:</span>
                <span className="font-semibold text-emerald-300">৳ {calculation.cccNetARV.toLocaleString()}</span>
              </div>
              {calculation.safeSelfFlats > 0 && (
                <div className="text-[11px] text-emerald-300/80 italic">
                  * নিজে বসবাসের {calculation.safeSelfFlats}টি ফ্ল্যাটে বিধিবদ্ধ ৪০% স্ব-বসবাস রিবেট সমন্বিত।
                </div>
              )}
            </div>

            {/* 17% Taxes Itemized */}
            <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>ইমারত ও ভূমি কর (৭%):</span>
                <span>৳ {calculation.cccHolding.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>বর্জ্য অপসারণ পরিচ্ছন্নতা কর (৭%):</span>
                <span>৳ {calculation.cccConservancy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>সড়ক বাতি কর (৩%):</span>
                <span>৳ {calculation.cccLighting.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700">
            আইনি ভিত্তি: চট্টগ্রাম সিটি কর্পোরেশন (ট্যাক্সেশন) রুলস ১৯৮৬
          </div>
        </div>

        {/* CARD 2: PWD Government Rent Ceiling Output */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-800">গণপূর্ত মন্ত্রণালয় (PWD পরিপত্র)</h3>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                সরকারি অফিস ভাড়া সিলিং
              </span>
            </div>

            <div className="mt-4 flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  মাসিক ভাড়া সিলিং ({calculation.rentedArea.toLocaleString()} ব.ফু.)
                </span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">
                  ৳ {calculation.pwdMonthlyRent.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">বার্ষিক মোট সিলিং</span>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  ৳ {calculation.pwdAnnualRent.toLocaleString()}
                </div>
              </div>
            </div>

            {/* PWD Details */}
            <div className="space-y-1.5 text-xs mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>প্রযোজ্য সরকারি রেট (প্রতি বর্গফুট):</span>
                <span className="font-bold text-slate-900">৳ {calculation.pwdEffectiveRate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>১৫% সরকারি ভ্যাট (বিল সংযুক্ত):</span>
                <span className="font-semibold text-blue-700">(+) ৳ {calculation.pwdVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উৎসে ৫% আয়কর কর্তন (TDS u/s 53A):</span>
                <span className="font-semibold text-rose-600">(-) ৳ {calculation.pwdTds.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex justify-between items-center text-xs">
              <span className="font-bold text-blue-950">মালিককে সরকারি অফিস কর্তন বাদে নিট প্রদেয়:</span>
              <span className="text-sm font-extrabold text-blue-800">
                ৳ {calculation.pwdNetPayableToOwner.toLocaleString()} / মাস
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            আইনি ভিত্তি: সরকারি অফিসের বাসা ভাড়ার হার পুন:নির্ধারণ পরিপত্র (গৃহায়ন ও গণপূর্ত মন্ত্রণালয়)
          </div>
        </div>

      </div>

      {/* COMPARATIVE ANALYSIS SUMMARY CARD */}
      <div className="mt-6 bg-slate-100/80 p-5 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          কর ও ভাড়া তুলনা এবং করদাতার নোট (Analysis Summary)
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          চসিক বার্ষিক মূল্যায়নের ক্ষেত্রে পুরো <strong>{calculation.totalArea.toLocaleString()} বর্গফুট</strong> এর ওপর ২ মাস মেরামত ছাড় এবং নিজে থাকার <strong>{calculation.safeSelfFlats}টি ফ্ল্যাটে ৪০% ছাড়</strong> দিয়ে মোট <strong>৳ {calculation.cccTotalAnnualTax.toLocaleString()}</strong> কর নির্ধারণ করে। অপরদিকে গণপূর্তের নিয়ম সরকারি অফিস বা সংস্থাকে ভাড়া দেওয়ার ক্ষেত্রে প্রযোজ্য এবং তা কেবল ভাড়াযোগ্য <strong>{calculation.rentedArea.toLocaleString()} বর্গফুট</strong> স্পেসের জন্য সর্বোচ্চ মাসিক ভাড়া <strong>৳ {calculation.pwdMonthlyRent.toLocaleString()}</strong> নির্ধারণ করে। আয়কর অ্যাসেসমেন্টে ফেয়ার মার্কেট রেট প্রমাণের ক্ষেত্রে উভয় রেট শিডিউলকে প্রামাণ্য দলিল হিসেবে উপস্থাপন করা যায়।
        </p>
      </div>
    </div>
  );
}
