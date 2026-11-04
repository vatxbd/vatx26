import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Briefcase, 
  Printer, 
  Calculator, 
  Info, 
  CheckCircle2, 
  FileText,
  Scale,
  Receipt,
  TrendingUp,
  Coins,
  ShieldCheck,
  Home,
  Percent,
  HelpCircle
} from "lucide-react";

interface AreaPreset {
  id: string;
  name: string;
  cccRate: number;
  pwdType: "pakkaMain" | "pakkaBranch" | "semiPakka" | "kacha";
  defaultCategory: "residential" | "commercial";
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
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 12, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 8, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, চকবাজার)", cccRate: 30, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 6, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2021": {
    pwdRates: { pakkaMain: 31, pakkaBranch: 24, semiPakka: 15, kacha: 9 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 14, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 9, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, চকবাজার)", cccRate: 35, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 6, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2022": {
    pwdRates: { pakkaMain: 32, pakkaBranch: 25, semiPakka: 16, kacha: 10 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 22, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 13, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 60, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 8, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2023": {
    pwdRates: { pakkaMain: 32, pakkaBranch: 25, semiPakka: 16, kacha: 10 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 23, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 14, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 65, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 9, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2024": {
    pwdRates: { pakkaMain: 34, pakkaBranch: 26, semiPakka: 17, kacha: 11 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 24, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 15, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 70, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 9, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2025": {
    pwdRates: { pakkaMain: 35, pakkaBranch: 27, semiPakka: 18, kacha: 12 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 25, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 16, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 75, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 10, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
  "2026": {
    pwdRates: { pakkaMain: 35, pakkaBranch: 27, semiPakka: 18, kacha: 12 },
    presets: [
      { id: "res_posh", name: "অভিজাত আবাসিক (খুলশী, নাসিরাবাদ, পাঁচলাইশ)", cccRate: 25, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "res_mid", name: "সাধারণ আবাসিক (বাকলিয়া, বহদ্দারহাট, হালিশহর)", cccRate: 16, pwdType: "pakkaBranch", defaultCategory: "residential" },
      { id: "com_prime", name: "বাণিজ্যিক প্রাইম (জিইসি, আগ্রাবাদ, আন্দরকিল্লা)", cccRate: 75, pwdType: "pakkaMain", defaultCategory: "commercial" },
      { id: "semi_pakka", name: "সেমিপাকা কাঠামো / সাধারণ এলাকা", cccRate: 10, pwdType: "semiPakka", defaultCategory: "residential" },
    ],
  },
};

// Helper: Compute Individual Tax under Bangladesh Tax Slabs (u/s Income Tax Act 2023)
function computeIndividualTax(taxableIncome: number, threshold = 350000): { totalTax: number; slabBreakdown: { slab: string; rate: number; taxable: number; tax: number }[] } {
  if (taxableIncome <= threshold) {
    return { totalTax: 0, slabBreakdown: [] };
  }

  let remaining = taxableIncome;
  let totalTax = 0;
  const slabBreakdown: { slab: string; rate: number; taxable: number; tax: number }[] = [];

  // Slab 1: First threshold (0%)
  const slab1 = Math.min(remaining, threshold);
  slabBreakdown.push({ slab: `প্রথম ৳ ${threshold.toLocaleString()}`, rate: 0, taxable: slab1, tax: 0 });
  remaining -= slab1;

  // Slab 2: Next 100,000 (5%)
  if (remaining > 0) {
    const slab2 = Math.min(remaining, 100000);
    const tax2 = Math.round(slab2 * 0.05);
    totalTax += tax2;
    slabBreakdown.push({ slab: "পরবর্তী ৳ ১,০০,০০০", rate: 5, taxable: slab2, tax: tax2 });
    remaining -= slab2;
  }

  // Slab 3: Next 400,000 (10%)
  if (remaining > 0) {
    const slab3 = Math.min(remaining, 400000);
    const tax3 = Math.round(slab3 * 0.10);
    totalTax += tax3;
    slabBreakdown.push({ slab: "পরবর্তী ৳ ৪,০০,০০০", rate: 10, taxable: slab3, tax: tax3 });
    remaining -= slab3;
  }

  // Slab 4: Next 500,000 (15%)
  if (remaining > 0) {
    const slab4 = Math.min(remaining, 500000);
    const tax4 = Math.round(slab4 * 0.15);
    totalTax += tax4;
    slabBreakdown.push({ slab: "পরবর্তী ৳ ৫,০০,০০০", rate: 15, taxable: slab4, tax: tax4 });
    remaining -= slab4;
  }

  // Slab 5: Next 500,000 (20%)
  if (remaining > 0) {
    const slab5 = Math.min(remaining, 500000);
    const tax5 = Math.round(slab5 * 0.20);
    totalTax += tax5;
    slabBreakdown.push({ slab: "পরবর্তী ৳ ৫,০০,০০০", rate: 20, taxable: slab5, tax: tax5 });
    remaining -= slab5;
  }

  // Slab 6: Balance (25%)
  if (remaining > 0) {
    const tax6 = Math.round(remaining * 0.25);
    totalTax += tax6;
    slabBreakdown.push({ slab: `অবশিষ্টাংশ (৳ ${remaining.toLocaleString()})`, rate: 25, taxable: remaining, tax: tax6 });
  }

  // Minimum tax in CCC area is Tk 5,000 if taxable income exceeds threshold
  if (taxableIncome > threshold && totalTax < 5000) {
    totalTax = 5000;
  }

  return { totalTax, slabBreakdown };
}

export default function CtgUnifiedTaxCalculator() {
  // --- Single Unified Input State ---
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("res_posh");
  const [unitSize, setUnitSize] = useState<number>(1200);
  const [totalFlats, setTotalFlats] = useState<number>(6);
  const [selfOccupiedFlats, setSelfOccupiedFlats] = useState<number>(1);

  // Property Nature for Income Tax Repair Deduction (25% for residential, 30% for commercial)
  const [propertyUse, setPropertyUse] = useState<"residential" | "commercial">("residential");
  
  // Taxpayer Category for Income Tax Exemption Threshold
  const [taxpayerType, setTaxpayerType] = useState<"general" | "female_senior" | "disabled" | "freedom_fighter">("general");

  // Rent Valuation Basis for House Property Income (CCC ARV rate vs PWD rate vs Custom)
  const [rentBasis, setRentBasis] = useState<"ccc_rate" | "pwd_rate" | "custom">("ccc_rate");
  const [customMonthlyRentPerFlat, setCustomMonthlyRentPerFlat] = useState<number>(30000);

  // Optional Overrides / Toggles
  const [customCccRate, setCustomCccRate] = useState<number>(25);
  const [applyPwdTenPercent, setApplyPwdTenPercent] = useState<boolean>(true);
  const [otherAllowableExpenses, setOtherAllowableExpenses] = useState<number>(0); // e.g. Land tax, loan interest

  // Update CCC rate & default category when year or area preset changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const presets = YEAR_DATA[year]?.presets || YEAR_DATA["2026"].presets;
    const currentPreset = presets.find((p) => p.id === selectedAreaId) || presets[0];
    setSelectedAreaId(currentPreset.id);
    setCustomCccRate(currentPreset.cccRate);
    setPropertyUse(currentPreset.defaultCategory);
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const presets = YEAR_DATA[selectedYear]?.presets || YEAR_DATA["2026"].presets;
    const currentPreset = presets.find((p) => p.id === areaId);
    if (currentPreset) {
      setCustomCccRate(currentPreset.cccRate);
      setPropertyUse(currentPreset.defaultCategory);
    }
  };

  // Taxpayer exemption thresholds under Bangladesh Budget / Income Tax Act 2023
  const exemptionThreshold = useMemo(() => {
    switch (taxpayerType) {
      case "female_senior": return 400000;
      case "disabled": return 475000;
      case "freedom_fighter": return 500000;
      case "general":
      default:
        return 350000;
    }
  }, [taxpayerType]);

  // --- Combined Computation Engine ---
  const calculation = useMemo(() => {
    const safeSelfFlats = Math.min(selfOccupiedFlats, totalFlats);
    const rentedFlats = Math.max(0, totalFlats - safeSelfFlats);
    const totalArea = unitSize * totalFlats;
    const rentedArea = unitSize * rentedFlats;
    const selfArea = unitSize * safeSelfFlats;

    // 1. CHITTAGONG CITY CORPORATION (CCC) CALCULATION (Taxation Rules 1986)
    const cccRentedMonthly = rentedArea * customCccRate;
    const cccSelfMonthly = selfArea * customCccRate;
    const cccTotalMonthly = cccRentedMonthly + cccSelfMonthly;

    // Statutory 2 months repair deduction (x 10 months ARV)
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

    // Proportionate CCC tax paid for rented portion (allowable deduction in Income Tax u/s 38(1)(a))
    const rentedFraction = totalFlats > 0 ? rentedFlats / totalFlats : 0;
    const cccTaxRentedPortion = Math.round(cccTotalAnnualTax * rentedFraction);
    const cccTaxSelfPortion = cccTotalAnnualTax - cccTaxRentedPortion;

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

    // 3. INCOME TAX CALCULATION (আয়কর আইন ২০২৩, ধারা ৩৬-৩৯ / গৃহসম্পত্তি হতে করযোগ্য আয়)
    // Determine Gross Annual Rental Value (বাৎসরিক প্রকৃত বা সম্ভাব্য ভাড়া)
    let effectiveMonthlyRentalIncome = 0;
    if (rentBasis === "ccc_rate") {
      effectiveMonthlyRentalIncome = cccRentedMonthly;
    } else if (rentBasis === "pwd_rate") {
      effectiveMonthlyRentalIncome = pwdMonthlyRent;
    } else {
      effectiveMonthlyRentalIncome = customMonthlyRentPerFlat * rentedFlats;
    }

    const grossAnnualRent = effectiveMonthlyRentalIncome * 12;

    // Self-Occupied Unit Benefit:
    // In Bangladesh Income Tax law, owner-occupied residential property generates ZERO taxable rent (সম্পূর্ণ করমুক্ত)
    const selfOccupiedImputedRentSaved = (safeSelfFlats * (unitSize * customCccRate)) * 12;

    // Statutory Repair & Maintenance Allowance (বিধিবদ্ধ সাধারণ মেরামত ও রক্ষণাবেক্ষণ ছাড় u/s 38(1)(b))
    // Residential = 25% (1/4th) of Gross Annual Rent
    // Commercial = 30% of Gross Annual Rent
    const repairRatePercentage = propertyUse === "commercial" ? 30 : 25;
    const repairDeduction = Math.round(grossAnnualRent * (repairRatePercentage / 100));

    // Municipal Tax (CCC Holding Tax) Deduction u/s 38(1)(a)
    // Only the municipal tax for the rented portion is deductible
    const municipalTaxDeduction = cccTaxRentedPortion;

    // Total Statutory Deductions
    const totalAllowableDeductions = repairDeduction + municipalTaxDeduction + otherAllowableExpenses;

    // Net Taxable Income from House Property (গৃহসম্পত্তি হতে নিট করযোগ্য আয়)
    const netTaxableIncome = Math.max(0, grossAnnualRent - totalAllowableDeductions);

    // Tax Computation under Slabs
    const { totalTax: estimatedIncomeTax, slabBreakdown } = computeIndividualTax(netTaxableIncome, exemptionThreshold);

    // Tax savings achieved through statutory deductions & self-occupancy
    const totalTaxSavedByRepairsAndRebates = Math.round(totalAllowableDeductions * 0.15); // Avg marginal 15%

    return {
      totalArea,
      rentedArea,
      selfArea,
      rentedFlats,
      safeSelfFlats,
      // CCC
      cccRate: customCccRate,
      cccTotalMonthly,
      cccRentedMonthly,
      cccSelfMonthly,
      cccNetARV,
      cccHolding,
      cccConservancy,
      cccLighting,
      cccTotalAnnualTax,
      cccQuarterly,
      cccTaxRentedPortion,
      cccTaxSelfPortion,
      cccSelfRebateAmount,
      // PWD
      pwdBaseRate,
      pwdEffectiveRate,
      pwdMonthlyRent,
      pwdAnnualRent,
      pwdVat,
      pwdTds,
      pwdNetPayableToOwner,
      pwdTypeLabel: currentPreset.pwdType,
      // Income Tax (গৃহসম্পত্তি হতে আয়)
      grossAnnualRent,
      effectiveMonthlyRentalIncome,
      repairRatePercentage,
      repairDeduction,
      municipalTaxDeduction,
      totalAllowableDeductions,
      netTaxableIncome,
      estimatedIncomeTax,
      slabBreakdown,
      selfOccupiedImputedRentSaved,
      totalTaxSavedByRepairsAndRebates,
    };
  }, [
    selectedYear, 
    selectedAreaId, 
    unitSize, 
    totalFlats, 
    selfOccupiedFlats, 
    customCccRate, 
    applyPwdTenPercent, 
    propertyUse, 
    taxpayerType, 
    rentBasis, 
    customMonthlyRentPerFlat, 
    otherAllowableExpenses,
    exemptionThreshold
  ]);

  // --- Year-wise Comparative Analysis Table (২০২০ - ২০২৬) ---
  const yearWiseData = useMemo(() => {
    const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    const safeSelfFlats = Math.min(selfOccupiedFlats, totalFlats);
    const rentedFlats = Math.max(0, totalFlats - safeSelfFlats);
    const rentedArea = unitSize * rentedFlats;
    const selfArea = unitSize * safeSelfFlats;
    const rentedFraction = totalFlats > 0 ? rentedFlats / totalFlats : 0;
    const repairRate = propertyUse === "commercial" ? 0.30 : 0.25;

    return years.map((yr) => {
      const yrData = YEAR_DATA[yr];
      const preset = yrData.presets.find((p) => p.id === selectedAreaId) || yrData.presets[0];
      const yrCccRate = preset.cccRate;

      // CCC calculation
      const yrRentedMonthly = rentedArea * yrCccRate;
      const yrSelfMonthly = selfArea * yrCccRate;
      const yrRentedAnnualARV = yrRentedMonthly * 10;
      const yrSelfAnnualARV = yrSelfMonthly * 10 * 0.6; // after 40% rebate
      const yrNetARV = yrRentedAnnualARV + yrSelfAnnualARV;
      const yrCccTax = Math.round(yrNetARV * 0.17);
      const yrCccRentedTax = Math.round(yrCccTax * rentedFraction);

      // PWD calculation
      const pwdBase = yrData.pwdRates[preset.pwdType] || 25;
      const pwdEff = applyPwdTenPercent ? Number((pwdBase * 1.1).toFixed(2)) : pwdBase;
      const yrPwdMonthly = Math.round(rentedArea * pwdEff);

      // Income Tax (CCC rental basis for standard comparison)
      const yrGrossRent = yrRentedMonthly * 12;
      const yrRepairAllowance = Math.round(yrGrossRent * repairRate);
      const yrNetTaxableIncome = Math.max(0, yrGrossRent - yrRepairAllowance - yrCccRentedTax - otherAllowableExpenses);
      const { totalTax: yrEstimatedTax } = computeIndividualTax(yrNetTaxableIncome, exemptionThreshold);

      return {
        year: yr,
        isCurrent: yr === selectedYear,
        cccRate: yrCccRate,
        cccTax: yrCccTax,
        pwdRate: pwdEff,
        pwdMonthly: yrPwdMonthly,
        grossRent: yrGrossRent,
        repairAllowance: yrRepairAllowance,
        cccTaxDeduction: yrCccRentedTax,
        netTaxableIncome: yrNetTaxableIncome,
        estimatedTax: yrEstimatedTax,
        reassessmentNote: yr === "2022" ? "চসিক পুনর্মূল্যায়ন কার্যকর" : undefined,
      };
    });
  }, [selectedAreaId, unitSize, totalFlats, selfOccupiedFlats, propertyUse, applyPwdTenPercent, otherAllowableExpenses, exemptionThreshold, selectedYear]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900 rounded-2xl shadow-sm border border-slate-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> vatx.bd 3-in-1 Unified Tax Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            চট্টগ্রাম মহানগরী সমন্বিত কর, ভাড়া ও আয়কর ক্যালকুলেটর
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            একক ইনপুটে চসিক হোল্ডিং ট্যাক্স (১৯৮৬), গণপূর্ত অফিস ভাড়া ও বিধিবদ্ধ মেরামত ছাড় সহ গৃহসম্পত্তির করযোগ্য আয় (আয়কর আইন ২০২৩)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" /> প্রিন্ট / সেভ PDF
          </button>
        </div>
      </div>

      {/* SINGLE UNIFIED INPUT SECTION */}
      <div className="mt-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            ভবন, ফ্ল্যাট ও করদাতার বিবরণ (একক সমন্বিত ইনপুট)
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            * একটি ইনপুটে ৩টি সরকারি দপ্তরের হিসাব একযোগে আপডেট হবে
          </span>
        </div>

        {/* Row 1: Year, Area Preset & Property Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">প্রযোজ্য অর্থবছর/সাল</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {Object.keys(YEAR_DATA).map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === "2022" ? "(চসিক রি-অ্যাসেসমেন্ট)" : ""}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ব্যবহারের ধরন (মেরামত ছাড়)</label>
            <select
              value={propertyUse}
              onChange={(e) => setPropertyUse(e.target.value as "residential" | "commercial")}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="residential">আবাসিক (২৫% মেরামত ছাড়)</option>
              <option value="commercial">বাণিজ্যিক / অফিস (৩০% ছাড়)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Flat Multipliers & Self Occupancy */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রতি ফ্ল্যাটের সাইজ (বর্গফুট)</label>
              <input
                type="number"
                value={unitSize}
                onChange={(e) => setUnitSize(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোট ফ্ল্যাট / ইউনিট সংখ্যা</label>
              <input
                type="number"
                value={totalFlats}
                onChange={(e) => setTotalFlats(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-emerald-900">
                  নিজে বসবাসকারী ফ্ল্যাট (অতিরিক্ত ছাড়)
                </label>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  ১০০% আয়কর মুক্ত
                </span>
              </div>
              <input
                type="number"
                value={selfOccupiedFlats}
                max={totalFlats}
                min={0}
                onChange={(e) => setSelfOccupiedFlats(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 text-sm font-extrabold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 border-t border-emerald-200 pt-3 gap-2">
            <span>
              মোট আয়তন: <strong className="text-slate-900">{calculation.totalArea.toLocaleString()} বর্গফুট</strong>
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-emerald-200 text-emerald-950 rounded-md font-semibold flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> মালিকের বসবাস: {calculation.safeSelfFlats}টি ফ্ল্যাট ({calculation.selfArea.toLocaleString()} ব.ফু.) — করমুক্ত
              </span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md font-semibold">
                ভাড়াযোগ্য স্পেস: {calculation.rentedFlats}টি ফ্ল্যাট ({calculation.rentedArea.toLocaleString()} ব.ফু.)
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Income Tax Parameters & CCC / PWD Tweaks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              গৃহসম্পত্তি ভাড়া মূল্য নির্ধারণের ভিত্তি
            </label>
            <select
              value={rentBasis}
              onChange={(e) => setRentBasis(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ccc_rate">চসিক সম্ভাব্য ভাড়া হার (৳ {customCccRate}/ব.ফু.)</option>
              <option value="pwd_rate">গণপূর্ত অফিস ভাড়া রেট (৳ {calculation.pwdEffectiveRate}/ব.ফু.)</option>
              <option value="custom">প্রকৃত মাসিক ভাড়া (ম্যানুয়াল এন্ট্রি)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              করদাতার ক্যাটাগরি (করমুক্ত আয়ের সীমা)
            </label>
            <select
              value={taxpayerType}
              onChange={(e) => setTaxpayerType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">সাধারণ করদাতা (করমুক্ত সীমা: ৳ ৩,৫০,০০০)</option>
              <option value="female_senior">মহিলা / ৬৫+ জ্যেষ্ঠ নাগরিক (৳ ৪,০০,০০০)</option>
              <option value="disabled">প্রতিবন্ধী ব্যক্তি (৳ ৪,৭৫,০০০)</option>
              <option value="freedom_fighter">গেজেটভুক্ত বীর মুক্তিযোদ্ধা (৳ ৫,০০,০০০)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              অন্যান্য অনুমোদিত খরচ (ভূমি রাজস্ব/ঋণের সুদ)
            </label>
            <input
              type="number"
              placeholder="টাকা (বাৎসরিক)"
              value={otherAllowableExpenses === 0 ? "" : otherAllowableExpenses}
              onChange={(e) => setOtherAllowableExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
        </div>

        {/* Optional Custom Rates Row */}
        {rentBasis === "custom" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-4 text-xs">
            <span className="font-bold text-amber-900">প্রতিটি ভাড়া ফ্ল্যাটের মাসিক বাস্তব ভাড়া:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customMonthlyRentPerFlat}
                onChange={(e) => setCustomMonthlyRentPerFlat(Math.max(0, Number(e.target.value)))}
                className="w-32 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-amber-800 font-medium">টাকা / মাস</span>
            </div>
            <span className="text-amber-700">
              (মোট {calculation.rentedFlats}টি ফ্ল্যাটে মাসিক মোট প্রাপ্তি: ৳ {(customMonthlyRentPerFlat * calculation.rentedFlats).toLocaleString()})
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">চসিক কাস্টম রেট:</span>
            <input
              type="number"
              value={customCccRate}
              onChange={(e) => setCustomCccRate(Number(e.target.value))}
              className="w-20 bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900"
            />
            <span>৳/ব.ফু.</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={applyPwdTenPercent}
              onChange={(e) => setApplyPwdTenPercent(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-slate-700 font-medium">
              গণপূর্তে মন্ত্রণালয়ের সর্বোচ্চ <strong>১০% বর্ধিত হার</strong> প্রয়োগ
            </span>
          </label>
        </div>
      </div>

      {/* 3-PILLAR OUTPUT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* CARD 1: CCC Holding Tax (Taxation Rules 1986) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">চসিক হোল্ডিং ট্যাক্স</h3>
              </div>
              <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                রুলস ১৯৮৬
              </span>
            </div>

            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">বার্ষিক সর্বমোট প্রদেয় কর</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                  ৳ {calculation.cccTotalAnnualTax.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">ত্রৈমাসিক কিস্তি</span>
                <div className="text-sm font-bold text-slate-200">
                  ৳ {calculation.cccQuarterly.toLocaleString()}
                </div>
              </div>
            </div>

            {/* CCC Breakdown */}
            <div className="space-y-1 text-xs mt-3 pt-2.5 border-t border-slate-700/80">
              <div className="flex justify-between text-slate-300">
                <span>সম্ভাব্য মাসিক ভাড়া (ARV ভ্যালু):</span>
                <span className="font-semibold text-white">৳ {calculation.cccTotalMonthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>২ মাস মেরামত ছাড় বাদে নিট ARV:</span>
                <span className="font-semibold text-emerald-300">৳ {calculation.cccNetARV.toLocaleString()}</span>
              </div>
              {calculation.safeSelfFlats > 0 && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-[11px] text-emerald-200 mt-1">
                  ✓ নিজে বসবাসের {calculation.safeSelfFlats}টি ফ্ল্যাটে বিধিবদ্ধ <strong>৪০% স্ব-বসবাস রিবেট</strong> সমন্বিত (ছাড়: ৳ {Math.round(calculation.cccSelfRebateAmount).toLocaleString()})
                </div>
              )}
            </div>

            {/* 17% Itemized */}
            <div className="mt-3 p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>ভূমি ও ইমারত কর (৭%):</span>
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

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-700">
            * ভাড়া ফ্ল্যাটের জন্য প্রযোজ্য পৌরকর <strong>৳ {calculation.cccTaxRentedPortion.toLocaleString()}</strong> যা আয়করে অনুমোদনযোগ্য কর্তন।
          </div>
        </div>

        {/* CARD 2: PWD Government Office Rent Ceiling */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">গণপূর্ত অফিস ভাড়া সিলিং</h3>
              </div>
              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
                PWD পরিপত্র
              </span>
            </div>

            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  মাসিক সিলিং ({calculation.rentedArea.toLocaleString()} ব.ফু.)
                </span>
                <div className="text-2xl font-extrabold text-blue-600 mt-0.5">
                  ৳ {calculation.pwdMonthlyRent.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">বার্ষিক মোট সিলিং</span>
                <div className="text-sm font-bold text-slate-800">
                  ৳ {calculation.pwdAnnualRent.toLocaleString()}
                </div>
              </div>
            </div>

            {/* PWD Details */}
            <div className="space-y-1.5 text-xs mt-3 pt-2.5 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>প্রযোজ্য সরকারি রেট (ব.ফু.):</span>
                <span className="font-bold text-slate-900">৳ {calculation.pwdEffectiveRate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>সরকারি ১৫% ভ্যাট (বিল সংযুক্ত):</span>
                <span className="font-semibold text-blue-700">(+) ৳ {calculation.pwdVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উৎস কর কর্তন (TDS u/s 53A - ৫%):</span>
                <span className="font-semibold text-rose-600">(-) ৳ {calculation.pwdTds.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-blue-950">
                <span>মালিকের নিট মাসিক প্রাপ্যতা:</span>
                <span className="font-extrabold text-blue-800">৳ {calculation.pwdNetPayableToOwner.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-blue-700">
                * উৎসে কর্তিত ৫% ট্যাক্স চালান আয়কর রিটার্নে অগ্রিম কর হিসেবে সমন্বয়যোগ্য।
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            আইনি ভিত্তি: সরকারি অফিসের বাসা ভাড়ার হার পুন:নির্ধারণ পরিপত্র (গৃহায়ন ও গণপূর্ত মন্ত্রণালয়)
          </div>
        </div>

        {/* CARD 3: NBR Income Tax House Property (আয়কর আইন ২০২৩, ধারা ৩৬-৩৯) */}
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800/50 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-emerald-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">করযোগ্য গৃহসম্পত্তি আয় ও কর</h3>
              </div>
              <span className="text-[11px] bg-emerald-900 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded font-mono">
                আয়কর আইন ২০২৩
              </span>
            </div>

            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">নিট করযোগ্য আয় (ধারা ৩৮ বাদে)</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                  ৳ {calculation.netTaxableIncome.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-300">প্রাক্কলিত আয়কর</span>
                <div className="text-base font-extrabold text-amber-300">
                  ৳ {calculation.estimatedIncomeTax.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Income Tax Breakdown */}
            <div className="space-y-1.5 text-xs mt-3 pt-2.5 border-t border-emerald-800/80">
              <div className="flex justify-between text-slate-300">
                <span>বাৎসরিক মোট ভাড়া মূল্য (Gross):</span>
                <span className="font-semibold text-white">৳ {calculation.grossAnnualRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-medium">
                <span>(-) বিধিবদ্ধ সাধারণ মেরামত ছাড় ({calculation.repairRatePercentage}%):</span>
                <span>(-) ৳ {calculation.repairDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-medium">
                <span>(-) চসিক হোল্ডিং ট্যাক্স কর্তন (u/s 38(1)(a)):</span>
                <span>(-) ৳ {calculation.municipalTaxDeduction.toLocaleString()}</span>
              </div>
              {otherAllowableExpenses > 0 && (
                <div className="flex justify-between text-emerald-300 font-medium">
                  <span>(-) অন্যান্য অনুমোদিত ব্যয়/ঋণের সুদ:</span>
                  <span>(-) ৳ {otherAllowableExpenses.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Special Highlight for Owner-Occupied Exemption */}
            <div className="mt-3 p-2.5 bg-emerald-900/70 border border-emerald-700/80 rounded-xl space-y-1 text-[11px]">
              <div className="flex items-center justify-between font-bold text-emerald-200">
                <span>স্ব-বসবাসকারী ফ্ল্যাটের কর অব্যাহতি:</span>
                <span className="text-white">১০০% করমুক্ত</span>
              </div>
              <div className="text-[10px] text-emerald-300/90 leading-tight">
                মালিক নিজে বসবাস করায় {calculation.safeSelfFlats}টি ফ্ল্যাটে বার্ষিক আনুমানিক <strong>৳ {calculation.selfOccupiedImputedRentSaved.toLocaleString()}</strong> সম্ভাব্য ভাড়া সম্পূর্ণ করমুক্ত রাখা হয়েছে।
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-emerald-800/80 flex justify-between items-center">
            <span>আইনি ভিত্তি: আয়কর আইন ২০২৩ (ধারা ৩৬, ৩৭ ও ৩৮)</span>
            {calculation.estimatedIncomeTax > 0 && calculation.estimatedIncomeTax === 5000 && (
              <span className="text-amber-400 font-semibold">চসিক নূন্যতম কর প্রযোজ্য</span>
            )}
          </div>
        </div>

      </div>

      {/* STATUTORY BENEFIT & SLAB BREAKDOWN DRAWER */}
      <div className="mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            বিধিবদ্ধ সাধারণ মেরামত ছাড় ও কর স্ল্যাব বিশ্লেষণ (Statutory Tax Slab Breakdown)
          </span>
          <span className="text-xs text-slate-500 font-normal">
            করমুক্ত আয় সীমা: <strong>৳ {exemptionThreshold.toLocaleString()}</strong>
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left: Deductions summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex justify-between">
              <span>অনুমোদনযোগ্য বিধিবদ্ধ মোট ছাড়:</span>
              <span className="text-emerald-700 font-extrabold">৳ {calculation.totalAllowableDeductions.toLocaleString()}</span>
            </div>
            <ul className="space-y-1 text-slate-600">
              <li className="flex justify-between">
                <span>• {propertyUse === "residential" ? "আবাসিক সাধারণ মেরামত (১/৪ অংশ বা ২৫%)" : "বাণিজ্যিক মেরামত ও রক্ষণাবেক্ষণ (৩০%)"}:</span>
                <span className="font-medium text-slate-900">৳ {calculation.repairDeduction.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>• চসিক পরিশোধিত হোল্ডিং ট্যাক্স (ভাড়া অংশের আনুপাতিক):</span>
                <span className="font-medium text-slate-900">৳ {calculation.municipalTaxDeduction.toLocaleString()}</span>
              </li>
              {otherAllowableExpenses > 0 && (
                <li className="flex justify-between">
                  <span>• খাজনা ও গৃহনির্মাণ ঋণের সুদ (ধারা ৩৮):</span>
                  <span className="font-medium text-slate-900">৳ {otherAllowableExpenses.toLocaleString()}</span>
                </li>
              )}
            </ul>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
              💡 <strong>করদাতার সুবিধা:</strong> এই বিধিবদ্ধ সাধারণ মেরামত ছাড় দাবি করার জন্য কোনো ভাউচার বা খরচের বিল প্রদর্শন বাধ্যতামূলক নয়; এটি আইন অনুযায়ী সরাসরি অনুমোদনযোগ্য।
            </div>
          </div>

          {/* Right: Slab-by-slab tax liability */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex justify-between">
              <span>ব্যক্তি শ্রেণির আয়কর স্ল্যাব বিভাজন:</span>
              <span className="text-slate-900 font-extrabold">৳ {calculation.estimatedIncomeTax.toLocaleString()}</span>
            </div>

            {calculation.slabBreakdown.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic">
                করযোগ্য আয় করমুক্ত সীমা ৳ {exemptionThreshold.toLocaleString()} এর নিচে থাকায় কোনো প্রদেয় আয়কর নেই (কর শূন্য)।
              </div>
            ) : (
              <div className="space-y-1">
                {calculation.slabBreakdown.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>• {s.slab} ({s.rate}%):</span>
                    <span className="font-medium text-slate-900">
                      করযোগ্য ৳ {s.taxable.toLocaleString()} ➔ <strong className="text-slate-800">৳ {s.tax.toLocaleString()}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
              <span>চট্টগ্রাম সিটি কর্পোরেশনে সর্বনিম্ন কর:</span>
              <span className="font-bold text-slate-800">৳ ৫,০০০</span>
            </div>
          </div>
        </div>
      </div>

      {/* YEAR-WISE COMPARATIVE ANALYSIS TABLE (2020 - 2026) */}
      <div className="mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              সাল-ওয়ারী বিধিবদ্ধ সাধারণ মেরামত ছাড় ও করযোগ্য আয়ের তুলনামূলক বিবরণী (২০২০ — ২০২৬)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              চসিক রেটের পরিবর্তন, মেরামত ছাড়ের প্রভাব ও সাল-ওয়ারী নিট করযোগ্য আয়ের পরিবর্তন পর্যালোচনা করুন (যেকোনো লাইনে ক্লিক করে সংশ্লিষ্ট সাল সক্রিয় করুন)
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">
            ভাড়া স্পেস: {calculation.rentedArea.toLocaleString()} ব.ফু. ({calculation.rentedFlats} ফ্ল্যাট)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">সাল / অর্থবছর</th>
                <th className="py-2.5 px-3">চসিক রেট (৳/ব.ফু.)</th>
                <th className="py-2.5 px-3">চসিক কর (১৭%)</th>
                <th className="py-2.5 px-3">গণপূর্ত ভাড়া (মাসিক)</th>
                <th className="py-2.5 px-3">বাৎসরিক মোট ভাড়া</th>
                <th className="py-2.5 px-3">বিধিবদ্ধ মেরামত ({calculation.repairRatePercentage}%)</th>
                <th className="py-2.5 px-3">চসিক কর ছাড়</th>
                <th className="py-2.5 px-3 text-emerald-900 bg-emerald-50">নিট করযোগ্য আয়</th>
                <th className="py-2.5 px-3 text-amber-900 bg-amber-50">প্রাক্কলিত কর</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {yearWiseData.map((row) => (
                <tr
                  key={row.year}
                  onClick={() => handleYearChange(row.year)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    row.isCurrent ? "bg-emerald-50/70 font-semibold" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                    {row.year}
                    {row.isCurrent && (
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                        বর্তমান
                      </span>
                    )}
                    {row.reassessmentNote && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded hidden sm:inline">
                        রি-অ্যাসেসমেন্ট
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">৳ {row.cccRate}</td>
                  <td className="py-2.5 px-3 text-slate-700">৳ {row.cccTax.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-blue-700 font-medium">৳ {row.pwdMonthly.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-800">৳ {row.grossRent.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-700">৳ {row.repairAllowance.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-700">৳ {row.cccTaxDeduction.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/50">
                    ৳ {row.netTaxableIncome.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-800 bg-amber-50/50">
                    ৳ {row.estimatedTax.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE LEGAL & TAXPAYER ANALYSIS NOTE */}
      <div className="mt-6 bg-slate-100/90 p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          করদাতা আইনি সহায়িকা ও বিধিবদ্ধ ব্যাখ্যার সারসংক্ষেপ (Statutory Rules & Compliance)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-bold">১. চসিক হোল্ডিং ট্যাক্স (রুলস ১৯৮৬):</strong>
            পুরো ভবনের ওপর সম্ভাব্য মাসিক ভাড়া নির্ধারণ করে ২ মাসের সমপরিমাণ মেরামত ছাড়ের পর বার্ষিক নিট মূল্যের (ARV) ১৭% ধার্য হয়। মালিক নিজে থাকলে স্ব-বসবাস অংশের ওপর ৪০% বিশেষ রিবেট বহাল থাকে।
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-bold">২. গণপূর্ত সরকারি অফিস ভাড়া সিলিং:</strong>
            সরকারি দপ্তরকে ভাড়া দেওয়ার ক্ষেত্রে PWD নির্ধারিত প্রতি বর্গফুট সিলিং রেট বাধ্যতামূলক। এছাড়া সরকারি দপ্তর ৫% হারে উৎসে আয়কর (TDS u/s 53A) কেটে চালান প্রদান করে, যা চূড়ান্ত রিটার্নে অগ্রিম কর ক্রেডিট নেওয়া যায়।
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-bold">৩. আয়কর আইন ২০২৩ (ধারা ৩৬-৩৯):</strong>
            গৃহসম্পত্তি হতে আয়ে কেবল ভাড়া দেওয়া অংশের আয় গণ্য হবে। স্ব-বসবাস সম্পূর্ণ করমুক্ত। স্থূল ভাড়া হতে আবাসিক ক্ষেত্রে ২৫% ও বাণিজ্যিক ক্ষেত্রে ৩০% বিধিবদ্ধ সাধারণ মেরামত ছাড় এবং চসিক পৌরকর কর্তন আইনত বাধ্যতামূলক।
          </div>
        </div>
      </div>
    </div>
  );
}

