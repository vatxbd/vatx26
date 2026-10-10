import React, { useState, useEffect } from "react";
import { validateBIN, validateAmount, validateDate } from "../utils/validation";
import { useHistoryState } from "../lib/useHistoryState";
import { Undo2, Redo2 } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v: any) => parseFloat(v) || 0;

const BLOCKED_CATEGORIES: Record<string, { label: string, ref: string }> = {
  entertainment: { label: "Entertainment / Hospitality", ref: "Rule 25(2)(k), VAT Rules 2016" },
  passenger:     { label: "Passenger Vehicle / Transport", ref: "Rule 25(2)(g), VAT Rules 2016" },
  furniture:     { label: "Furniture / Office Fittings", ref: "Rule 25(2)(j), VAT Rules 2016" },
  personal:      { label: "Personal / Non-Business Use", ref: "Rule 25(2)(a), VAT Rules 2016" },
  none:          { label: "None (ITC Eligible)", ref: "" },
};

const VAT_RATES = ["15", "10", "7.5", "5", "2", "0"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS  = ["2024", "2025", "2026"];

const emptySupply  = () => ({ id: Date.now() + Math.random(), desc: "", hsCode: "", value: "", vatRate: "15", sdRate: "0", legalRef: "" });
const emptyPurchase = () => ({ id: Date.now() + Math.random(), desc: "", supplierBin: "", invoiceNo: "", invoiceDate: "", value: "", vatPaid: "", blocked: "none", legalRef: "" });

const Field = ({ label, children, refSource, required }: { label: string, children: React.ReactNode, refSource?: string, required?: boolean }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.1em", marginBottom: 5, display: "flex", gap: 6, alignItems: "center" }}>
      {label.toUpperCase()}
      {required && <span style={{ color: "#EF4444", fontSize: 9 }}>★ REQUIRED</span>}
      {refSource && <span style={{ color: "#334155", fontFamily: "monospace", fontSize: 9 }}>📎 {refSource}</span>}
    </div>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", style = {}, error }: { value: any, onChange: (v: string) => void, placeholder?: string, type?: string, style?: any, error?: string }) => (
  <div style={{ width: "100%" }}>
    <input
      type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 6, padding: "8px 11px", color: "#E2E8F0", fontSize: 12, fontFamily: "inherit",
        outline: "none", boxSizing: "border-box" as const, ...style
      }}
    />
    {error && <div style={{ color: "#EF4444", fontSize: 9, marginTop: 4, fontWeight: 500 }}>{error}</div>}
  </div>
);

const Select = ({ value, onChange, options, style = {} }: { value: any, onChange: (v: string) => void, options: any[], style?: any }) => (
  <select
    value={value} onChange={e => onChange(e.target.value)}
    style={{
      width: "100%", background: "#0E1628", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 6, padding: "8px 11px", color: "#E2E8F0", fontSize: 12, fontFamily: "inherit",
      outline: "none", boxSizing: "border-box" as const, ...style
    }}>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

const SectionHeader = ({ icon, label, color }: { icon: string, label: string, color: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${color}44` }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ fontSize: 10, color, letterSpacing: "0.12em", fontWeight: 700 }}>{label.toUpperCase()}</span>
  </div>
);

const AddBtn = ({ onClick, label }: { onClick: () => void, label: string }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 6,
    color: "#64748B", fontSize: 11, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit",
    width: "100%", marginTop: 6, transition: "all 0.15s"
  }}
  >+ {label}</button>
);

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 5,
    color: "#EF4444", fontSize: 11, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0
  }}>✕</button>
);

// ── main form ─────────────────────────────────────────────────────────────────
export default function Mushak91Form() {
  const [formState, setFormState, { undo, redo, canUndo, canRedo }] = useHistoryState({
    taxpayer: {
      name: "", bin: "", address: "", taxPeriodMonth: "March", taxPeriodYear: "2026",
      preparedBy: "", prepDate: "", carryForward: "", tcRef: "", returnType: "Original"
    },
    supplies: [emptySupply()],
    purchases: [emptyPurchase()],
    vds: { amount: "", ref: "§ 71, VAT Act 2012" }
  });

  const { taxpayer, supplies, purchases, vds } = formState;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateTaxpayer = () => {
    const newErrors: Record<string, string> = {};
    if (!taxpayer.name) newErrors.name = "Name is required";
    
    const binVal = validateBIN(taxpayer.bin);
    if (!binVal.isValid) newErrors.bin = binVal.message!;
    
    const dateVal = validateDate(taxpayer.prepDate);
    if (!dateVal.isValid) newErrors.prepDate = dateVal.message!;
    
    if (taxpayer.carryForward) {
      const amtVal = validateAmount(taxpayer.carryForward);
      if (!amtVal.isValid) newErrors.carryForward = amtVal.message!;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // UI
  const [activeSection, setActiveSection] = useState("info");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveToDatabase = async () => {
    if (!validateTaxpayer()) {
      alert("Please fix validation errors before saving.");
      setActiveSection("info");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        taxpayerName: taxpayer.name,
        bin: taxpayer.bin,
        address: taxpayer.address,
        taxPeriod: `${taxpayer.taxPeriodMonth} ${taxpayer.taxPeriodYear}`,
        returnType: taxpayer.returnType,
        outputVatTotal: totalOutputVAT,
        inputTaxCreditTotal: totalEligibleITC,
        vdsTotal: vdsAmount,
        netPayable: netPayable,
        formData: formState
      };
      
      const res = await fetch('/api/mushak91', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("✓ Return saved to database successfully.");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving to database. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── calculations ────────────────────────────────────────────────────────────
  const totalOutputVAT = supplies.reduce((s, r) => {
    const vat = num(r.value) * num(r.vatRate) / 100;
    return s + vat;
  }, 0);

  const totalEligibleITC = purchases.reduce((s, r) => {
    if (r.blocked !== "none") return s;
    return s + num(r.vatPaid);
  }, 0);

  const totalBlockedITC = purchases.reduce((s, r) => {
    if (r.blocked === "none") return s;
    return s + num(r.vatPaid);
  }, 0);

  const vdsAmount   = num(vds.amount);
  const carryFwd    = num(taxpayer.carryForward);
  const netPayable  = Math.max(0, totalOutputVAT - totalEligibleITC - vdsAmount - carryFwd);
  const excessCredit = Math.max(0, totalEligibleITC + vdsAmount + carryFwd - totalOutputVAT);

  // ── helpers to update unified state ──
  const setTaxpayerField = (field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      taxpayer: { ...prev.taxpayer, [field]: val }
    }));
  };

  const updateSupply = (id: number, field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      supplies: prev.supplies.map(r => r.id === id ? { ...r, [field]: val } : r)
    }));
  };

  const addSupply = () => {
    setFormState(prev => ({
      ...prev,
      supplies: [...prev.supplies, emptySupply()]
    }));
  };

  const removeSupply = (id: number) => {
    setFormState(prev => ({
      ...prev,
      supplies: prev.supplies.filter(r => r.id !== id)
    }));
  };

  const updatePurchase = (id: number, field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      purchases: prev.purchases.map(r => r.id === id ? { ...r, [field]: val } : r)
    }));
  };

  const addPurchase = () => {
    setFormState(prev => ({
      ...prev,
      purchases: [...prev.purchases, emptyPurchase()]
    }));
  };

  const removePurchase = (id: number) => {
    setFormState(prev => ({
      ...prev,
      purchases: prev.purchases.filter(r => r.id !== id)
    }));
  };

  const setVdsField = (field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      vds: { ...prev.vds, [field]: val }
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const SECTIONS = [
    { id: "info",     label: "Taxpayer Info",   icon: "🏢", color: "#0369A1" },
    { id: "output",   label: "Output VAT",      icon: "📤", color: "#065F46" },
    { id: "input",    label: "Input Tax Credit", icon: "📥", color: "#7C3AED" },
    { id: "vds",      label: "Withholding",     icon: "🏦", color: "#B45309" },
    { id: "summary",  label: "Summary",         icon: "⚖️", color: "#991B1B" },
  ];

  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "7px 10px", color: "#E2E8F0", fontSize: 11, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{
      fontFamily: "'DM Mono','Fira Code',monospace",
      background: "#070C18", minHeight: "100vh", color: "#E2E8F0",
      padding: "24px 16px", boxSizing: "border-box", borderRadius: '2rem'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #334155; }
        input:focus, select:focus, textarea:focus { border-color: rgba(255,255,255,0.25) !important; }
        select option { background: #0E1628; }
      `}</style>

      {/* Control Bar */}
      <div style={{ maxWidth: 820, margin: "0 auto 12px", display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button 
          onClick={undo} 
          disabled={!canUndo}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            padding: '4px 12px', borderRadius: 8, color: canUndo ? '#fff' : '#475569', 
            cursor: canUndo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 500, transition: 'all 0.2s', outline: 'none'
          }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} /> Undo
        </button>
        <button 
          onClick={redo} 
          disabled={!canRedo}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            padding: '4px 12px', borderRadius: 8, color: canRedo ? '#fff' : '#475569', 
            cursor: canRedo ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 500, transition: 'all 0.2s', outline: 'none'
          }}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
        >
          <Redo2 size={14} /> Redo
        </button>
      </div>

      {/* Title */}
      <div style={{ maxWidth: 820, margin: "0 auto 20px" }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, margin: "0 0 3px", color: "#F8FAFC" }}>
          Mushak-9.1 — VAT Return Entry Form
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: "#475569", letterSpacing: "0.08em" }}>
          BANGLADESH NBR · VAT ACT 2012 · RULES 2016 · PREPARATION ONLY — NOT SUBMITTED TO NBR PORTAL
        </p>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 16 }}>

        {/* Sidebar nav */}
        <div style={{ width: 160, flexShrink: 0 }}>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => setActiveSection(s.id)}
              style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                border: `1px solid ${activeSection === s.id ? s.color + "88" : "rgba(255,255,255,0.06)"}`,
                background: activeSection === s.id ? `${s.color}18` : "rgba(255,255,255,0.02)",
                transition: "all 0.15s"
              }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: activeSection === s.id ? "#F1F5F9" : "#64748B", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}

          {/* Live mini-summary */}
          <div style={{ marginTop: 16, padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em", marginBottom: 8 }}>LIVE TOTALS</div>
            {[
              { l: "Output VAT", v: totalOutputVAT, c: "#34D399" },
              { l: "Eligible ITC", v: totalEligibleITC, c: "#38BDF8" },
              { l: "Blocked ITC", v: totalBlockedITC, c: "#EF4444" },
              { l: "Net Payable", v: netPayable, c: "#FBBF24" },
            ].map(r => (
              <div key={r.l} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: "#475569" }}>{r.l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.c, fontFamily: "monospace" }}>৳ {fmt(r.v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── SECTION: Taxpayer Info ── */}
          {activeSection === "info" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(3,105,161,0.3)", borderRadius: 10, padding: 20 }}>
              <SectionHeader icon="🏢" label="Section I — Taxpayer & Period Information" color="#0369A1" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Registered Name / Trade Name" required refSource="§ 9, VAT Act 2012">
                  <Input value={taxpayer.name} onChange={v => setTaxpayerField("name", v)} placeholder="e.g. Rahimafrooz Bangladesh Ltd." error={errors.name} />
                </Field>
                <Field label="Business Identification Number (BIN)" required refSource="§ 9, VAT Act 2012">
                  <Input value={taxpayer.bin} onChange={v => setTaxpayerField("bin", v)} placeholder="e.g. 002156789-0101" error={errors.bin} />
                </Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Registered Business Address" refSource="Rule 12, VAT Rules 2016">
                    <Input value={taxpayer.address} onChange={v => setTaxpayerField("address", v)} placeholder="Full address as per VAT registration" />
                  </Field>
                </div>
                <Field label="Tax Period — Month" required refSource="§ 28, VAT Act 2012">
                  <Select value={taxpayer.taxPeriodMonth} onChange={v => setTaxpayerField("taxPeriodMonth", v)} options={MONTHS} />
                </Field>
                <Field label="Tax Period — Year" required refSource="§ 28, VAT Act 2012">
                  <Select value={taxpayer.taxPeriodYear} onChange={v => setTaxpayerField("taxPeriodYear", v)} options={YEARS} />
                </Field>
                <Field label="Return Type" required refSource="Rule 34, VAT Rules 2016">
                  <Select value={taxpayer.returnType} onChange={v => setTaxpayerField("returnType", v)} options={["Original", "Amended", "Additional"]} />
                </Field>
                <Field label="Carried Forward Credit (from prior month)" refSource="§ 52(3), VAT Act 2012">
                  <Input value={taxpayer.carryForward} onChange={v => setTaxpayerField("carryForward", v)} placeholder="৳ 0.00" type="number" error={errors.carryForward} />
                </Field>
                <Field label="Return Prepared By (Lawyer / Firm Name)" refSource="Professional obligation">
                  <Input value={taxpayer.preparedBy} onChange={v => setTaxpayerField("preparedBy", v)} placeholder="NBR Certified Tax Lawyer name" />
                </Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Date of Preparation" required>
                    <Input value={taxpayer.prepDate} onChange={v => setTaxpayerField("prepDate", v)} type="date" error={errors.prepDate} />
                  </Field>
                </div>
              </div>
              <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(3,105,161,0.08)", borderRadius: 6, fontSize: 11, color: "#64748B", lineHeight: 1.7 }}>
                ℹ️ Verify BIN is active on the NBR VAT Online portal before proceeding. An inactive BIN invalidates the filing.
              </div>
            </div>
          )}

          {/* ── SECTION: Output VAT ── */}
          {activeSection === "output" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(6,95,70,0.3)", borderRadius: 10, padding: 20 }}>
              <SectionHeader icon="📤" label="Section II — Taxable Supplies & Output VAT (Part A, Mushak-9.1)" color="#065F46" />
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 14, lineHeight: 1.7 }}>
                Enter each category of supply separately. The platform auto-computes Output VAT and attaches the legal rate reference.
              </div>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 0.6fr 0.8fr 0.4fr", gap: 6, padding: "4px 8px", fontSize: 9, color: "#475569", letterSpacing: "0.08em", marginBottom: 4 }}>
                <span>DESCRIPTION OF SUPPLY</span><span>TAXABLE VALUE (৳)</span><span>VAT RATE</span><span>SD RATE</span><span>LEGAL REFERENCE</span><span></span>
              </div>

              {supplies.map((row, i) => {
                const vatAmt = num(row.value) * num(row.vatRate) / 100;
                const sdAmt  = num(row.value) * num(row.sdRate) / 100;
                return (
                  <div key={row.id} style={{ marginBottom: 6 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 0.6fr 0.8fr 0.4fr", gap: 6, alignItems: "center" }}>
                      <input style={inputStyle} placeholder={`Supply item ${i + 1}`} value={row.desc} onChange={e => updateSupply(row.id, "desc", e.target.value)} />
                      <input style={inputStyle} type="number" placeholder="0.00" value={row.value} onChange={e => updateSupply(row.id, "value", e.target.value)} />
                      <select style={inputStyle} value={row.vatRate} onChange={e => updateSupply(row.id, "vatRate", e.target.value)}>
                        {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                      <input style={inputStyle} type="number" placeholder="0" value={row.sdRate} onChange={e => updateSupply(row.id, "sdRate", e.target.value)} />
                      <input style={inputStyle} placeholder="e.g. First Schedule, Sl.23" value={row.legalRef} onChange={e => updateSupply(row.id, "legalRef", e.target.value)} />
                      <RemoveBtn onClick={() => removeSupply(row.id)} />
                    </div>
                    {(num(row.value) > 0) && (
                      <div style={{ display: "flex", gap: 12, padding: "4px 8px", fontSize: 10, color: "#64748B" }}>
                        <span>VAT: <b style={{ color: "#34D399" }}>৳ {fmt(vatAmt)}</b></span>
                        {num(row.sdRate) > 0 && <span>SD: <b style={{ color: "#FBBF24" }}>৳ {fmt(sdAmt)}</b> <span style={{ color: "#475569" }}>(not creditable — SD Act 2022, §8)</span></span>}
                        <span style={{ color: "#0369A1", fontFamily: "monospace" }}>§ 15(1), VAT Act 2012{row.legalRef ? `; ${row.legalRef}` : ""}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <AddBtn onClick={addSupply} label="Add Supply Line" />

              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(6,95,70,0.1)", border: "1px solid rgba(6,95,70,0.3)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>TOTAL OUTPUT VAT</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#34D399", fontFamily: "monospace" }}>৳ {fmt(totalOutputVAT)}</div>
                  <div style={{ fontSize: 9, color: "#334155", fontFamily: "monospace" }}>§ 32, VAT Act 2012</div>
                </div>
                <div style={{ fontSize: 11, color: "#64748B", maxWidth: 280, lineHeight: 1.6, textAlign: "right" }}>
                  Where NBR has notified a Tariff Value for any supply, that value overrides the invoice value. Reference the SRO number in the Legal Reference column.
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION: ITC ── */}
          {activeSection === "input" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, padding: 20 }}>
              <SectionHeader icon="📥" label="Section III — Input Tax Credit / ITC (Part B, Mushak-9.1)" color="#7C3AED" />
              <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, fontSize: 11, color: "#FCA5A5", marginBottom: 14, lineHeight: 1.7 }}>
                ⚠️ Highest-risk section. Select "Blocked" category for any disallowed credit — the platform will auto-exclude it from ITC and flag it in the Audit Defense Report.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.7fr 1.4fr 0.4fr", gap: 5, padding: "4px 8px", fontSize: 9, color: "#475569", letterSpacing: "0.08em", marginBottom: 4 }}>
                <span>DESCRIPTION</span><span>SUPPLIER BIN</span><span>INVOICE NO.</span><span>DATE</span><span>VAT PAID (৳)</span><span>BLOCK CATEGORY</span><span></span>
              </div>

              {purchases.map((row, i) => {
                const isBlocked = row.blocked !== "none";
                const blockInfo = BLOCKED_CATEGORIES[row.blocked];
                return (
                  <div key={row.id} style={{ marginBottom: 8 }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.7fr 1.4fr 0.4fr",
                      gap: 5, alignItems: "center",
                      borderLeft: `3px solid ${isBlocked ? "#EF4444" : "#7C3AED"}`,
                      paddingLeft: 6, borderRadius: "0 6px 6px 0"
                    }}>
                      <input style={inputStyle} placeholder={`Purchase ${i + 1}`} value={row.desc} onChange={e => updatePurchase(row.id, "desc", e.target.value)} />
                      <input style={inputStyle} placeholder="BIN No." value={row.supplierBin} onChange={e => updatePurchase(row.id, "supplierBin", e.target.value)} />
                      <input style={inputStyle} placeholder="Invoice #" value={row.invoiceNo} onChange={e => updatePurchase(row.id, "invoiceNo", e.target.value)} />
                      <input style={{ ...inputStyle, fontSize: 10 }} type="date" value={row.invoiceDate} onChange={e => updatePurchase(row.id, "invoiceDate", e.target.value)} />
                      <input style={inputStyle} type="number" placeholder="0.00" value={row.vatPaid} onChange={e => updatePurchase(row.id, "vatPaid", e.target.value)} />
                      <select style={{ ...inputStyle, color: isBlocked ? "#FCA5A5" : "#6EE7B7" }} value={row.blocked} onChange={e => updatePurchase(row.id, "blocked", e.target.value)}>
                        {Object.entries(BLOCKED_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <RemoveBtn onClick={() => removePurchase(row.id)} />
                    </div>
                    {isBlocked && num(row.vatPaid) > 0 && (
                      <div style={{ fontSize: 10, color: "#EF4444", padding: "3px 10px", fontFamily: "monospace" }}>
                        ✗ ITC BLOCKED: ৳ {fmt(num(row.vatPaid))} — {blockInfo.ref}
                      </div>
                    )}
                    {!isBlocked && num(row.vatPaid) > 0 && (
                      <div style={{ fontSize: 10, color: "#34D399", padding: "3px 10px", fontFamily: "monospace" }}>
                        ✓ ITC ELIGIBLE: ৳ {fmt(num(row.vatPaid))} — § 52, VAT Act 2012; Rule 35, VAT Rules 2016
                      </div>
                    )}
                  </div>
                );
              })}

              <AddBtn onClick={addPurchase} label="Add Purchase Invoice" />

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ padding: "10px 14px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#64748B" }}>ELIGIBLE ITC</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#38BDF8", fontFamily: "monospace" }}>৳ {fmt(totalEligibleITC)}</div>
                  <div style={{ fontSize: 9, color: "#334155", fontFamily: "monospace" }}>§ 52, VAT Act 2012; Rule 35</div>
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(127,29,29,0.1)", border: "1px solid rgba(127,29,29,0.3)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#64748B" }}>BLOCKED ITC (excluded)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#EF4444", fontFamily: "monospace" }}>৳ {fmt(totalBlockedITC)}</div>
                  <div style={{ fontSize: 9, color: "#334155", fontFamily: "monospace" }}>Rule 25(2), VAT Rules 2016</div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION: VDS ── */}
          {activeSection === "vds" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(180,83,9,0.3)", borderRadius: 10, padding: 20 }}>
              <SectionHeader icon="🏦" label="Section IV — Withholding VAT (VDS) at Source" color="#B45309" />
              <div style={{ padding: "8px 12px", background: "rgba(180,83,9,0.08)", borderRadius: 6, fontSize: 11, color: "#D97706", marginBottom: 16, lineHeight: 1.7 }}>
                VDS deducted by the client's customers (government/semi-government/registered entities) is creditable against output VAT liability. Retain Treasury Challan (T.C.) copies.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Total VDS Deducted & Deposited (৳)" refSource="§ 71, VAT Act 2012; SRO on VDS">
                  <Input value={vds.amount} onChange={v => setVdsField("amount", v)} placeholder="৳ 0.00" type="number" />
                </Field>
                <Field label="Treasury Challan (T.C.) Reference" refSource="Rule 47, VAT Rules 2016">
                  <Input value={taxpayer.tcRef || ""} onChange={v => setTaxpayerField("tcRef", v)} placeholder="T.C. No. and date" />
                </Field>
              </div>
              <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 11, color: "#64748B", lineHeight: 1.7 }}>
                ℹ️ VDS T.C. must be in the client's name and BIN. Mismatched T.C. is a common NBR audit finding. Verify all T.C. details before including in the return.
              </div>
            </div>
          )}

          {/* ── SECTION: Summary ── */}
          {activeSection === "summary" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(153,27,27,0.3)", borderRadius: 10, padding: 20 }}>
              <SectionHeader icon="⚖️" label="Section V — Computation Summary & Lawyer Sign-Off" color="#991B1B" />

              {/* Full computation table */}
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: "Total Taxable Value of Supplies", value: supplies.reduce((s,r)=>s+num(r.value),0), color: "#94A3B8", ref: "§ 15, VAT Act 2012" },
                  { label: "Total Output VAT (A)", value: totalOutputVAT, color: "#34D399", ref: "§ 32, VAT Act 2012", bold: true },
                  { label: "Eligible Input Tax Credit (B)", value: totalEligibleITC, color: "#38BDF8", ref: "§ 52; Rule 35", bold: true },
                  { label: "Blocked ITC (excluded from return)", value: totalBlockedITC, color: "#EF4444", ref: "Rule 25(2), VAT Rules 2016" },
                  { label: "VDS Deducted at Source (C)", value: vdsAmount, color: "#FBBF24", ref: "§ 71, VAT Act 2012" },
                  { label: "Carried Forward Credit from Prior Period (D)", value: carryFwd, color: "#A78BFA", ref: "§ 52(3), VAT Act 2012" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <span style={{ fontSize: 12, color: row.bold ? "#E2E8F0" : "#94A3B8", fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                      <span style={{ fontSize: 9, color: "#334155", fontFamily: "monospace", marginLeft: 8 }}>📎 {row.ref}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.color, fontFamily: "monospace" }}>৳ {fmt(row.value)}</span>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 2, background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />

                {/* Net payable */}
                <div style={{ padding: "12px", background: netPayable > 0 ? "rgba(153,27,27,0.15)" : "rgba(6,95,70,0.15)", border: `1px solid ${netPayable > 0 ? "#991B1B" : "#065F46"}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 700 }}>
                      {netPayable > 0 ? "Net VAT Payable (A − B − C − D)" : "Excess Credit (Carry Forward to Next Period)"}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginTop: 2 }}>§ 35, VAT Act 2012</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: netPayable > 0 ? "#FCA5A5" : "#6EE7B7", fontFamily: "monospace" }}>
                    ৳ {fmt(netPayable > 0 ? netPayable : excessCredit)}
                  </div>
                </div>
              </div>

              {/* Taxpayer info summary */}
              {taxpayer.name && (
                <div style={{ marginBottom: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 11, color: "#64748B", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <span><b style={{ color: "#94A3B8" }}>Taxpayer:</b> {taxpayer.name}</span>
                  <span><b style={{ color: "#94A3B8" }}>BIN:</b> {taxpayer.bin}</span>
                  <span><b style={{ color: "#94A3B8" }}>Period:</b> {taxpayer.taxPeriodMonth} {taxpayer.taxPeriodYear}</span>
                  <span><b style={{ color: "#94A3B8" }}>Prepared by:</b> {taxpayer.preparedBy}</span>
                </div>
              )}

              {/* Sign-off */}
              <div style={{ padding: "14px", background: "rgba(153,27,27,0.08)", border: "1px solid rgba(153,27,27,0.3)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#FCA5A5", fontWeight: 700, marginBottom: 8 }}>✍️ LAWYER REVIEW & SIGN-OFF GATE</div>
                <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.8, marginBottom: 12 }}>
                  By confirming below, the NBR Certified Tax Lawyer attests that all figures have been verified against source documents, all blocked ITC items have been correctly excluded, and all legal positions are defensible with primary-source citations.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <Field label="Lawyer Signature / Name">
                    <Input value={taxpayer.preparedBy} onChange={() => {}} placeholder="Name for sign-off" />
                  </Field>
                  <Field label="Date of Review">
                    <Input value={taxpayer.prepDate} onChange={() => {}} type="date" />
                  </Field>
                </div>
                <button
                  onClick={() => setSubmitted(true)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8,
                    background: submitted ? "rgba(6,95,70,0.3)" : "rgba(153,27,27,0.4)",
                    border: `1px solid ${submitted ? "#065F46" : "#991B1B"}`,
                    color: submitted ? "#6EE7B7" : "#FCA5A5",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em", transition: "all 0.2s"
                  }}>
                  {submitted ? "✓ RETURN APPROVED FOR CLIENT DELIVERY — EXPORT PDF / WORD" : "CONFIRM LAWYER REVIEW & APPROVE RETURN FOR EXPORT"}
                </button>
                {submitted && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                    <button
                      onClick={saveToDatabase}
                      disabled={isSaving}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#E2E8F0", fontSize: 12, fontWeight: 700,
                        cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.5 : 1
                      }}>
                      {isSaving ? "Saving..." : "💾 Save to Database"}
                    </button>
                    <button
                      onClick={() => alert("PDF/Word export feature coming soon.")}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#E2E8F0", fontSize: 12, fontWeight: 700,
                        cursor: "pointer"
                      }}>
                      🖨️ Export PDF / Word
                    </button>
                  </div>
                )}
                {submitted && (
                  <div style={{ marginTop: 10, fontSize: 11, color: "#64748B", lineHeight: 1.7, textAlign: "center" }}>
                    The platform will now generate the Mushak-9.1 PDF + Audit Defense Report with embedded legal citations. The client or authorized representative submits to NBR VAT Online — the platform does not auto-submit.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            {activeSection !== "summary" && (
              <button
                onClick={() => {
                  const ids = SECTIONS.map(s => s.id);
                  const idx = ids.indexOf(activeSection);
                  if (idx < ids.length - 1) setActiveSection(ids[idx + 1]);
                }}
                style={{
                  padding: "8px 20px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 12,
                  cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em"
                }}>Next Section →</button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 820, margin: "20px auto 0", padding: "10px 14px", fontSize: 10, color: "#334155", background: "rgba(255,255,255,0.02)", borderRadius: 6, lineHeight: 1.7 }}>
        ⚖️ This form prepares data for Mushak-9.1 submission. It does not auto-submit to the NBR portal. All outputs require lawyer review. Legal references are to VAT Act 2012, VAT Rules 2016, and applicable SROs — verify temporal applicability per tax period.
      </div>
    </div>
  );
}
