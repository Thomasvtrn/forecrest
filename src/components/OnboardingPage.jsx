import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight, ArrowLeft, Buildings, User, Briefcase,
  Cloud, ShoppingCart, Storefront, UserCircle, SquaresFour, Check,
} from "@phosphor-icons/react";
import Button from "./Button";
import { useAuth } from "../context/useAuth";
import { useT } from "../context/useLang";

var LEGAL_FORMS = [
  { value: "srl", label: "SRL" },
  { value: "sa", label: "SA" },
  { value: "sc", label: "SC" },
  { value: "snc", label: "SNC" },
  { value: "scomm", label: "SComm" },
  { value: "asbl", label: "ASBL" },
  { value: "ei", label: "Entreprise individuelle" },
  { value: "other", label: "Autre" },
];

var BIZ_TYPES = [
  { id: "saas", icon: Cloud, color: "var(--color-info)" },
  { id: "ecommerce", icon: ShoppingCart, color: "var(--color-success)" },
  { id: "retail", icon: Storefront, color: "var(--color-warning)" },
  { id: "services", icon: Briefcase, color: "var(--brand)" },
  { id: "freelancer", icon: UserCircle, color: "#8B5CF6" },
  { id: "other", icon: SquaresFour, color: "var(--text-muted)" },
];

/* ── Shared sub-components ── */

function InputField({ label, value, onChange, placeholder, error, required, readOnly, type }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--sp-1)" }}>
        {label}{required ? <span style={{ color: "var(--color-error)", marginLeft: 2 }}>*</span> : null}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={readOnly ? undefined : onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: "100%", height: 44, padding: "0 14px",
          fontSize: 14, color: readOnly ? "var(--text-faint)" : "var(--text-primary)",
          background: readOnly ? "var(--bg-accordion)" : "var(--bg-page)",
          border: "1.5px solid " + (error ? "var(--color-error)" : "var(--border)"),
          borderRadius: "var(--r-md)", outline: "none",
          boxSizing: "border-box", fontFamily: "inherit",
          transition: "border-color 0.15s",
          cursor: readOnly ? "not-allowed" : undefined,
        }}
      />
      {error ? <div style={{ fontSize: 12, color: "var(--color-error)", marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error, required, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--sp-1)" }}>
        {label}{required ? <span style={{ color: "var(--color-error)", marginLeft: 2 }}>*</span> : null}
      </label>
      <select
        value={value}
        onChange={function (e) { onChange(e.target.value); }}
        style={{
          width: "100%", height: 44, padding: "0 14px",
          fontSize: 14, color: value ? "var(--text-primary)" : "var(--text-faint)",
          background: "var(--bg-page)",
          border: "1.5px solid " + (error ? "var(--color-error)" : "var(--border)"),
          borderRadius: "var(--r-md)", outline: "none",
          boxSizing: "border-box", fontFamily: "inherit",
        }}
      >
        <option value="" disabled>{placeholder || "Choisir..."}</option>
        {options.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
      </select>
      {error ? <div style={{ fontSize: 12, color: "var(--color-error)", marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}

function BizTypeCard({ type, selected, onClick, t }) {
  var Icon = type.icon;
  var active = selected;
  return (
    <button onClick={onClick} style={{
      flex: "1 1 calc(33.33% - 8px)", minWidth: 120, padding: "var(--sp-4) var(--sp-3)",
      borderRadius: "var(--r-lg)",
      border: active ? "2px solid " + type.color : "1.5px solid var(--border)",
      background: active ? type.color + "12" : "var(--bg-card)",
      cursor: "pointer", textAlign: "center", transition: "all 0.15s",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "var(--r-md)",
        background: active ? type.color : "var(--bg-accordion)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        <Icon size={20} weight={active ? "fill" : "duotone"} color={active ? "#fff" : type.color} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
        {t["ob_biz_" + type.id] || type.id}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.3 }}>
        {t["ob_biz_" + type.id + "_desc"] || ""}
      </div>
    </button>
  );
}

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: "var(--sp-5)" }}>
      {Array.from({ length: total }).map(function (_, i) {
        var active = i === current;
        var done = i < current;
        return (
          <div key={i} style={{
            width: active ? 24 : 8, height: 8, borderRadius: 4,
            background: (active || done) ? "var(--brand)" : "var(--border-light)",
            opacity: done ? 0.4 : 1, transition: "all 0.3s ease",
          }} />
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════ */

export default function OnboardingPage({ onComplete }) {
  var t = useT().onboarding || {};
  var auth = useAuth();

  var [step, setStep] = useState(0);
  var [companyName, setCompanyName] = useState("");
  var [legalForm, setLegalForm] = useState("");
  var [tvaNumber, setTvaNumber] = useState("");
  var [firstName, setFirstName] = useState("");
  var [lastName, setLastName] = useState("");
  var [userRole, setUserRole] = useState("");
  var [phone, setPhone] = useState("");
  var [businessType, setBusinessType] = useState("");
  var [fieldErrors, setFieldErrors] = useState({});

  var email = auth.user ? auth.user.email : "";

  function validate() {
    var errs = {};
    if (step === 0) {
      if (!companyName.trim() || companyName.trim().length < 2) errs.companyName = t.ob_err_company || "Nom requis (min. 2 caract\u00e8res)";
      if (!legalForm) errs.legalForm = t.ob_err_legal || "Forme juridique requise";
      if (tvaNumber.trim() && !/^BE\s?0?\d{3}\.?\d{3}\.?\d{3}$/.test(tvaNumber.trim())) errs.tvaNumber = t.ob_err_tva || "Format: BE0123.456.789";
    }
    if (step === 1) {
      if (!firstName.trim()) errs.firstName = t.ob_err_firstname || "Pr\u00e9nom requis";
      if (!lastName.trim()) errs.lastName = t.ob_err_lastname || "Nom requis";
    }
    if (step === 2) {
      if (!businessType) errs.businessType = t.ob_err_biztype || "S\u00e9lectionnez un type d'activit\u00e9";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    if (step < 2) {
      setStep(function (s) { return s + 1; });
    } else {
      onComplete({
        companyName: companyName.trim(),
        legalForm: legalForm,
        tvaNumber: tvaNumber.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userRole: userRole.trim(),
        email: email,
        phone: phone.trim(),
        businessType: businessType,
      });
    }
  }

  function handleBack() {
    setStep(function (s) { return Math.max(0, s - 1); });
    setFieldErrors({});
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleNext();
  }

  var titles = [
    { title: t.ob_step1_title || "Votre entreprise", sub: t.ob_step1_sub || "Commençons par les informations de base." },
    { title: t.ob_step2_title || "Responsable l\u00e9gal", sub: t.ob_step2_sub || "Qui g\u00e8re cette entreprise ?" },
    { title: t.ob_step3_title || "Type d'activit\u00e9", sub: t.ob_step3_sub || "Quel est votre mod\u00e8le \u00e9conomique ?" },
  ];
  var pg = titles[step] || titles[0];

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-page)", padding: "var(--sp-4)", overflowY: "auto",
    }} onKeyDown={handleKeyDown}>

      <div style={{
        width: 480, maxWidth: "100%",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        padding: "var(--sp-8) var(--sp-6)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "var(--sp-5)" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--r-md)",
            background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", lineHeight: 1 }}>F</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>
            Forecrest
          </span>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-5)" }}>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 var(--sp-1)", fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif", letterSpacing: "-0.5px" }}>
            {pg.title}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
            {pg.sub}
          </p>
        </div>

        {/* ── Step 1: Entreprise ── */}
        {step === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <InputField label={t.ob_company_name || "Nom de l'entreprise"} value={companyName} onChange={function (e) { setCompanyName(e.target.value); setFieldErrors({}); }} placeholder="Ex: Glow Up" error={fieldErrors.companyName} required />
            <SelectField label={t.ob_legal_form || "Forme juridique"} value={legalForm} onChange={function (v) { setLegalForm(v); setFieldErrors({}); }} options={LEGAL_FORMS} error={fieldErrors.legalForm} required placeholder={t.ob_legal_placeholder || "Choisir..."} />
            <InputField label={t.ob_tva || "Num\u00e9ro TVA"} value={tvaNumber} onChange={function (e) { setTvaNumber(e.target.value); setFieldErrors({}); }} placeholder="BE0123.456.789" error={fieldErrors.tvaNumber} />
          </div>
        ) : null}

        {/* ── Step 2: Responsable ── */}
        {step === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
              <InputField label={t.ob_firstname || "Pr\u00e9nom"} value={firstName} onChange={function (e) { setFirstName(e.target.value); setFieldErrors({}); }} placeholder="Thomas" error={fieldErrors.firstName} required />
              <InputField label={t.ob_lastname || "Nom"} value={lastName} onChange={function (e) { setLastName(e.target.value); setFieldErrors({}); }} placeholder="Voituron" error={fieldErrors.lastName} required />
            </div>
            <InputField label={t.ob_role || "Fonction"} value={userRole} onChange={function (e) { setUserRole(e.target.value); }} placeholder="CEO / Fondateur" />
            <InputField label="Email" value={email} readOnly />
            <InputField label={t.ob_phone || "T\u00e9l\u00e9phone"} value={phone} onChange={function (e) { setPhone(e.target.value); }} placeholder="+32 400 00 00 00" type="tel" />
          </div>
        ) : null}

        {/* ── Step 3: Activité ── */}
        {step === 2 ? (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-3)", marginBottom: fieldErrors.businessType ? "var(--sp-2)" : 0 }}>
              {BIZ_TYPES.map(function (bt) {
                return <BizTypeCard key={bt.id} type={bt} selected={businessType === bt.id} onClick={function () { setBusinessType(bt.id); setFieldErrors({}); }} t={t} />;
              })}
            </div>
            {fieldErrors.businessType ? <div style={{ fontSize: 12, color: "var(--color-error)", marginTop: "var(--sp-2)", textAlign: "center" }}>{fieldErrors.businessType}</div> : null}
          </div>
        ) : null}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-5)" }}>
          {step > 0 ? (
            <Button color="tertiary" size="lg" onClick={handleBack} iconLeading={<ArrowLeft size={16} />} sx={{ flex: "0 0 auto" }}>
              {t.ob_back || "Retour"}
            </Button>
          ) : null}
          <Button
            color="primary" size="lg" onClick={handleNext}
            iconTrailing={step < 2 ? <ArrowRight size={16} /> : <Check size={16} weight="bold" />}
            sx={{ flex: 1, justifyContent: "center" }}
          >
            {step < 2 ? (t.ob_continue || "Continuer") : (t.ob_finish || "Commencer")}
          </Button>
        </div>

        <ProgressDots total={3} current={step} />
      </div>
    </div>,
    document.body
  );
}
