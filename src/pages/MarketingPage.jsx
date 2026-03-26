import { useState, useMemo, useEffect } from "react";
import {
  Megaphone, TrendUp, CurrencyCircleDollar, Users, Target,
  Plus, Trash, PencilSimple, Funnel as FunnelIcon, Crosshair,
  Envelope, ArrowDown,
} from "@phosphor-icons/react";
import {
  PageLayout, KpiCard, Card, Button, DataTable, Badge, Wizard,
  Modal, ModalFooter, SearchInput, FilterDropdown, SelectDropdown,
  ExportButtons, DevOptionsButton, DonutChart, ChartLegend, PaletteToggle,
  ActionBtn, ConfirmDeleteModal, DatePicker, CurrencyInput, NumberField,
} from "../components";
import ModulePaywall from "../components/ModulePaywall";
import { eur, eurShort, pct, makeId, calcTotalRevenue } from "../utils";
import { useT, useLang, useDevMode } from "../context";

/* ── Shared styles ── */
var labelStyle = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: "var(--sp-1)" };

/* ── Channel metadata ── */
var CHANNEL_META = {
  meta:      { label: { fr: "Facebook & Instagram", en: "Facebook & Instagram" }, desc: { fr: "Publicité sur les réseaux Meta.", en: "Advertising on Meta networks." }, badge: "brand", icon: Target, defaultCpc: 0.80, defaultCtr: 0.02, defaultConvRate: 0.03, defaultAov: 50 },
  google:    { label: { fr: "Google", en: "Google" }, desc: { fr: "Apparaître dans les résultats de recherche et sur YouTube.", en: "Appear in search results and on YouTube." }, badge: "info", icon: Target, defaultCpc: 1.50, defaultCtr: 0.035, defaultConvRate: 0.04, defaultAov: 60 },
  linkedin:  { label: { fr: "LinkedIn", en: "LinkedIn" }, desc: { fr: "Toucher des professionnels et décideurs.", en: "Reach professionals and decision-makers." }, badge: "warning", icon: Users, defaultCpc: 5.00, defaultCtr: 0.008, defaultConvRate: 0.02, defaultAov: 120 },
  tiktok:    { label: { fr: "TikTok", en: "TikTok" }, desc: { fr: "Publicité vidéo courte pour un public jeune.", en: "Short video ads for a younger audience." }, badge: "success", icon: TrendUp, defaultCpc: 0.40, defaultCtr: 0.015, defaultConvRate: 0.02, defaultAov: 35 },
  seo:       { label: { fr: "Référencement naturel", en: "Organic search (SEO)" }, desc: { fr: "Être trouvé sur Google sans payer de pub.", en: "Be found on Google without paying for ads." }, badge: "gray", icon: TrendUp, defaultCpc: 0, defaultCtr: 0.05, defaultConvRate: 0.05, defaultAov: 50 },
  email:     { label: { fr: "E-mailing", en: "Email marketing" }, desc: { fr: "Campagnes e-mail et newsletters.", en: "Email campaigns and newsletters." }, badge: "info", icon: Envelope, defaultCpc: 0.10, defaultCtr: 0.03, defaultConvRate: 0.04, defaultAov: 40 },
};
var CHANNEL_KEYS = Object.keys(CHANNEL_META);

var OBJECTIVE_META = {
  awareness:  { label: { fr: "Notoriété", en: "Awareness" }, badge: "info" },
  traffic:    { label: { fr: "Trafic", en: "Traffic" }, badge: "brand" },
  conversion: { label: { fr: "Conversion", en: "Conversion" }, badge: "success" },
  leads:      { label: { fr: "Leads", en: "Leads" }, badge: "warning" },
};

var STATUS_META = {
  draft:     { label: { fr: "Brouillon", en: "Draft" }, badge: "gray" },
  active:    { label: { fr: "Active", en: "Active" }, badge: "success" },
  paused:    { label: { fr: "En pause", en: "Paused" }, badge: "warning" },
  completed: { label: { fr: "Terminée", en: "Completed" }, badge: "info" },
};

/* ── Fake data for paywall preview ── */
var FAKE_KPIS = [
  { label: "Budget mensuel", value: "2 450,00 €" },
  { label: "CAC", value: "18,50 €" },
  { label: "ROAS", value: "3.2x" },
  { label: "Leads / mois", value: "132" },
];

var FAKE_CHANNELS = [
  { id: "f1", channel: "meta", name: "Campagne Facebook Lead Gen", budget: 800, cpc: 0.65, clicks: 1230, conversions: 42 },
  { id: "f2", channel: "google", name: "Google Search Brand", budget: 1200, cpc: 1.80, clicks: 667, conversions: 58 },
  { id: "f3", channel: "linkedin", name: "LinkedIn B2B Decision Makers", budget: 450, cpc: 5.20, clicks: 87, conversions: 12 },
];

/* ── Fake preview component (shown behind paywall) ── */
function FakePreview({ lang }) {
  var lk = lang === "en" ? "en" : "fr";
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        {FAKE_KPIS.map(function (kpi) {
          return <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />;
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sp-3)" }}>
            {lk === "fr" ? "Répartition du budget" : "Budget breakdown"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
            <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
              <circle cx={40} cy={40} r={30} fill="none" stroke="var(--brand)" strokeWidth={10} strokeDasharray="58 130" transform="rotate(-90 40 40)" />
              <circle cx={40} cy={40} r={30} fill="none" stroke="var(--color-info)" strokeWidth={10} strokeDasharray="45 143" strokeDashoffset={-58} transform="rotate(-90 40 40)" />
              <circle cx={40} cy={40} r={30} fill="none" stroke="var(--color-warning)" strokeWidth={10} strokeDasharray="28 160" strokeDashoffset={-103} transform="rotate(-90 40 40)" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ l: "Meta Ads", p: "33%", c: "var(--brand)" }, { l: "Google Ads", p: "49%", c: "var(--color-info)" }, { l: "LinkedIn", p: "18%", c: "var(--color-warning)" }].map(function (r) {
                return (
                  <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.c, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)", flex: 1 }}>{r.l}</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.p}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sp-3)" }}>
            {lk === "fr" ? "Performance par canal" : "Channel performance"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {[{ l: "Meta", w: "65%", v: "ROAS 3.8x" }, { l: "Google", w: "85%", v: "ROAS 4.2x" }, { l: "LinkedIn", w: "35%", v: "ROAS 1.9x" }].map(function (b) {
              return (
                <div key={b.l}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                    <span>{b.l}</span><span style={{ fontWeight: 600 }}>{b.v}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: b.w, background: "var(--brand)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "var(--sp-3) var(--sp-4)", background: "var(--bg-accordion)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span>{lk === "fr" ? "Campagne" : "Campaign"}</span>
          <span style={{ textAlign: "right" }}>Budget</span>
          <span style={{ textAlign: "right" }}>CPC</span>
          <span style={{ textAlign: "right" }}>Clicks</span>
          <span style={{ textAlign: "right" }}>Conversions</span>
        </div>
        {FAKE_CHANNELS.map(function (ch) {
          var m = CHANNEL_META[ch.channel];
          return (
            <div key={ch.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                <span style={{ fontWeight: 500 }}>{ch.name}</span>
                {m ? <Badge color={m.badge} size="sm">{m.label[lk]}</Badge> : null}
              </div>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{eur(ch.budget)}</span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{eur(ch.cpc)}</span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{String(ch.clicks)}</span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--brand)" }}>{String(ch.conversions)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Marketing Wizard (post-unlock) ── */
function MarketingWizard({ onFinish, lang }) {
  var lk = lang === "en" ? "en" : "fr";
  var [channels, setChannels] = useState({ meta: true, google: true });
  var [budget, setBudget] = useState(1000);

  var steps = [
    {
      key: "intro",
      content: (
        <div style={{ textAlign: "center" }}>
          <Megaphone size={56} weight="duotone" style={{ color: "var(--brand)", marginBottom: "var(--sp-4)" }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: "var(--sp-3)" }}>
            {lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "var(--sp-4)", textAlign: "left" }}>
            {lk === "fr"
              ? "Combien investir en publicité ? Sur quelles plateformes ? Et surtout, est-ce que ça rapporte ? Ce module vous aide à répondre à ces questions et intègre vos dépenses marketing directement dans votre plan financier."
              : "How much to invest in ads? On which platforms? And most importantly, is it paying off? This module helps answer these questions and integrates your marketing spend directly into your financial plan."}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-3)", textAlign: "left" }}>
            {[
              { icon: Target, title: lk === "fr" ? "Où investir ?" : "Where to invest?", desc: lk === "fr" ? "Choisissez vos plateformes : Facebook, Google, LinkedIn, TikTok ou référencement." : "Pick your platforms: Facebook, Google, LinkedIn, TikTok or SEO." },
              { icon: TrendUp, title: lk === "fr" ? "Est-ce rentable ?" : "Is it profitable?", desc: lk === "fr" ? "Voyez combien chaque client vous coûte et ce qu'il rapporte." : "See how much each customer costs and what they bring in." },
              { icon: CurrencyCircleDollar, title: lk === "fr" ? "Tout est connecté" : "Everything connects", desc: lk === "fr" ? "Vos dépenses pub apparaissent automatiquement dans vos charges." : "Your ad spend automatically appears in your costs." },
            ].map(function (card, ci) {
              var CIcon = card.icon;
              return (
                <div key={ci} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--r-lg)", padding: "var(--sp-3)", background: "var(--bg-accordion)" }}>
                  <CIcon size={20} weight="duotone" color="var(--brand)" style={{ marginBottom: "var(--sp-2)" }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{card.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      key: "channels",
      content: (
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: "var(--sp-2)", textAlign: "center" }}>
            {lk === "fr" ? "Quels canaux utilisez-vous ?" : "Which channels do you use?"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "var(--sp-4)", textAlign: "center" }}>
            {lk === "fr" ? "Sélectionnez vos canaux d'acquisition. Vous pourrez en ajouter d'autres ensuite." : "Select your acquisition channels. You can add more later."}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {CHANNEL_KEYS.map(function (ck) {
              var m = CHANNEL_META[ck];
              var isActive = channels[ck];
              return (
                <button key={ck} type="button" onClick={function () { setChannels(function (prev) { var nc = Object.assign({}, prev); nc[ck] = !nc[ck]; return nc; }); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--sp-3)",
                    padding: "var(--sp-3) var(--sp-4)",
                    border: "2px solid " + (isActive ? "var(--brand)" : "var(--border-light)"),
                    borderRadius: "var(--r-lg)", background: isActive ? "var(--brand-bg)" : "var(--bg-accordion)",
                    cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s, background 0.15s",
                  }}>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "var(--brand)" : "var(--text-primary)" }}>{m.label[lk]}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{m.desc[lk]}</div>
                  </div>
                  {isActive ? (
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1.5 4.5L4 7L9.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: "1.5px solid var(--border-strong)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ),
      canAdvance: Object.keys(channels).some(function (k) { return channels[k]; }),
    },
    {
      key: "budget",
      content: (
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: "var(--sp-2)", textAlign: "center" }}>
            {lk === "fr" ? "Quel est votre budget mensuel ?" : "What's your monthly budget?"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "var(--sp-5)", textAlign: "center" }}>
            {lk === "fr" ? "Le budget total sera réparti entre vos canaux. Vous pourrez ajuster ensuite." : "The total budget will be split across your channels. You can adjust later."}
          </div>
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            <label style={labelStyle}>
              {lk === "fr" ? "Budget marketing mensuel" : "Monthly marketing budget"}
            </label>
            <CurrencyInput value={budget} onChange={setBudget} suffix="€" width="100%" height={48} />
          </div>
          {budget > 0 ? (
            <div style={{ marginTop: "var(--sp-4)", padding: "var(--sp-3) var(--sp-4)", background: "var(--bg-accordion)", borderRadius: "var(--r-md)", border: "1px solid var(--border-light)", maxWidth: 300, margin: "var(--sp-4) auto 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: "var(--text-muted)" }}>{lk === "fr" ? "Budget annuel" : "Annual budget"}</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{eur(budget * 12)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--text-faint)" }}>{lk === "fr" ? "Ajouté automatiquement à vos charges" : "Automatically added to your costs"}</span>
              </div>
            </div>
          ) : null}
        </div>
      ),
      canAdvance: budget > 0,
    },
  ];

  function handleFinish() {
    var activeChannels = [];
    Object.keys(channels).forEach(function (k) { if (channels[k]) activeChannels.push(k); });
    onFinish({ channels: activeChannels, budget: budget });
  }

  return (
    <Wizard
      steps={steps}
      onFinish={handleFinish}
      finishLabel={lk === "fr" ? "Configurer le module" : "Set up module"}
      finishIcon={<Megaphone size={16} />}
      finishDisabled={budget <= 0}
    />
  );
}

/* ── Helper: safe divide ── */
function safeDiv(a, b) { return b > 0 ? a / b : 0; }

/* ──────────────────────────────────────────────────────────────
   CHANNELS TAB
   ────────────────────────────────────────────────────────────── */
function ChannelsTab({ channels, setChannelsData, lk, chartPalette, chartPaletteMode, onChartPaletteChange, accentRgb }) {
  var [search, setSearch] = useState("");
  var [modalOpen, setModalOpen] = useState(false);
  var [editIdx, setEditIdx] = useState(-1);
  var [form, setForm] = useState({});
  var [confirmDelete, setConfirmDelete] = useState(null);

  var enabledChannels = useMemo(function () {
    return (channels || []).filter(function (ch) { return ch.enabled !== false; });
  }, [channels]);

  var filtered = useMemo(function () {
    if (!search) return channels || [];
    var q = search.toLowerCase();
    return (channels || []).filter(function (ch) {
      var m = CHANNEL_META[ch.platform];
      var label = m ? m.label[lk] : ch.platform;
      return label.toLowerCase().indexOf(q) >= 0;
    });
  }, [channels, search, lk]);

  /* KPIs */
  var totalBudget = 0;
  var totalConversions = 0;
  var totalRevenue = 0;
  var activeCount = 0;
  enabledChannels.forEach(function (ch) {
    var b = ch.monthlyBudget || 0;
    totalBudget += b;
    var clicks = safeDiv(b, ch.cpc || 1);
    var conv = clicks * (ch.conversionRate || 0);
    totalConversions += conv;
    totalRevenue += conv * (ch.avgOrderValue || 0);
    if (b > 0) activeCount++;
  });
  var avgCac = safeDiv(totalBudget, totalConversions);
  var avgRoas = safeDiv(totalRevenue, totalBudget);

  /* DonutChart data */
  var budgetDistribution = useMemo(function () {
    var dist = {};
    enabledChannels.forEach(function (ch) {
      if ((ch.monthlyBudget || 0) > 0) {
        var m = CHANNEL_META[ch.platform];
        var label = m ? m.label[lk] : ch.platform;
        dist[label] = (dist[label] || 0) + ch.monthlyBudget;
      }
    });
    return dist;
  }, [enabledChannels, lk]);

  var channelMeta = useMemo(function () {
    var meta = {};
    enabledChannels.forEach(function (ch) {
      var m = CHANNEL_META[ch.platform];
      if (m) {
        var label = m.label[lk];
        meta[label] = { label: { fr: label, en: label }, badge: m.badge };
      }
    });
    return meta;
  }, [enabledChannels, lk]);

  function openAdd() {
    setEditIdx(-1);
    setForm({ platform: "meta", monthlyBudget: 500, cpc: CHANNEL_META.meta.defaultCpc, ctr: CHANNEL_META.meta.defaultCtr, conversionRate: CHANNEL_META.meta.defaultConvRate, avgOrderValue: CHANNEL_META.meta.defaultAov, enabled: true });
    setModalOpen(true);
  }

  function openEdit(idx) {
    setEditIdx(idx);
    setForm(Object.assign({}, (channels || [])[idx]));
    setModalOpen(true);
  }

  function saveChannel() {
    var next = (channels || []).slice();
    if (editIdx >= 0) {
      next[editIdx] = Object.assign({}, next[editIdx], form);
    } else {
      next.push(Object.assign({ id: makeId("mch"), enabled: true }, form));
    }
    setChannelsData(next);
    setModalOpen(false);
  }

  function removeChannel(idx) {
    var next = (channels || []).slice();
    next.splice(idx, 1);
    setChannelsData(next);
    setConfirmDelete(null);
  }

  function onPlatformChange(platform) {
    var m = CHANNEL_META[platform];
    setForm(function (prev) {
      return Object.assign({}, prev, {
        platform: platform,
        cpc: m ? m.defaultCpc : prev.cpc,
        ctr: m ? m.defaultCtr : prev.ctr,
        conversionRate: m ? m.defaultConvRate : prev.conversionRate,
        avgOrderValue: m ? m.defaultAov : prev.avgOrderValue,
      });
    });
  }

  var columns = useMemo(function () {
    return [
      {
        id: "platform", header: lk === "fr" ? "Canal" : "Channel",
        enableSorting: true, meta: { align: "left", minWidth: 160, grow: true },
        accessorFn: function (row) { var m = CHANNEL_META[row.platform]; return m ? m.label[lk] : row.platform; },
        cell: function (info) {
          var ch = info.row.original;
          var m = CHANNEL_META[ch.platform];
          return m ? <Badge color={m.badge} size="sm" dot>{m.label[lk]}</Badge> : ch.platform;
        },
        footer: function () {
          return (
            <>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 8 }}>{(channels || []).length} {lk === "fr" ? "canaux" : "channels"}</span>
            </>
          );
        },
      },
      {
        id: "budget", header: lk === "fr" ? "Budget/mois" : "Budget/mo",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.monthlyBudget || 0; },
        cell: function (info) { return eur(info.getValue()); },
        footer: function () { return <span style={{ fontWeight: 600 }}>{eur(totalBudget)}</span>; },
      },
      {
        id: "cpc", header: "CPC",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.cpc || 0; },
        cell: function (info) { return eur(info.getValue()); },
      },
      {
        id: "ctr", header: "CTR",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.ctr || 0; },
        cell: function (info) { return pct(info.getValue()); },
      },
      {
        id: "convRate", header: lk === "fr" ? "Conv. %" : "Conv. %",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.conversionRate || 0; },
        cell: function (info) { return pct(info.getValue()); },
      },
      {
        id: "clicks", header: lk === "fr" ? "Clics est." : "Est. clicks",
        enableSorting: true, meta: { align: "right", rawNumber: true },
        accessorFn: function (row) { return Math.round(safeDiv(row.monthlyBudget || 0, row.cpc || 1)); },
        cell: function (info) { return String(info.getValue()); },
        footer: function () {
          var tot = 0;
          enabledChannels.forEach(function (ch) { tot += Math.round(safeDiv(ch.monthlyBudget || 0, ch.cpc || 1)); });
          return <span style={{ fontWeight: 600 }}>{String(tot)}</span>;
        },
      },
      {
        id: "conversions", header: lk === "fr" ? "Conv. est." : "Est. conv.",
        enableSorting: true, meta: { align: "right", rawNumber: true },
        accessorFn: function (row) {
          var clicks = safeDiv(row.monthlyBudget || 0, row.cpc || 1);
          return Math.round(clicks * (row.conversionRate || 0));
        },
        cell: function (info) { return <span style={{ fontWeight: 600, color: "var(--brand)" }}>{String(info.getValue())}</span>; },
        footer: function () { return <span style={{ fontWeight: 600, color: "var(--brand)" }}>{String(Math.round(totalConversions))}</span>; },
      },
      {
        id: "cac", header: "CAC",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) {
          var clicks = safeDiv(row.monthlyBudget || 0, row.cpc || 1);
          var conv = clicks * (row.conversionRate || 0);
          return conv > 0 ? (row.monthlyBudget || 0) / conv : Infinity;
        },
        cell: function (info) {
          var v = info.getValue();
          return v === Infinity || !isFinite(v) ? <span style={{ color: "var(--text-faint)" }}>—</span> : eur(v);
        },
      },
      {
        id: "roas", header: "ROAS",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) {
          var clicks = safeDiv(row.monthlyBudget || 0, row.cpc || 1);
          var conv = clicks * (row.conversionRate || 0);
          var rev = conv * (row.avgOrderValue || 0);
          return safeDiv(rev, row.monthlyBudget || 0);
        },
        cell: function (info) {
          var v = info.getValue();
          return v > 0 ? <span style={{ fontWeight: 600 }}>{v.toFixed(1) + "x"}</span> : <span style={{ color: "var(--text-faint)" }}>—</span>;
        },
      },
      {
        id: "actions", header: "",
        enableSorting: false, meta: { align: "center", compactPadding: true, width: 1 },
        cell: function (info) {
          var idx = info.row.index;
          return (
            <div style={{ display: "flex", gap: 4 }}>
              <ActionBtn icon={<PencilSimple size={14} />} title={lk === "fr" ? "Modifier" : "Edit"} onClick={function () { openEdit(idx); }} />
              <ActionBtn icon={<Trash size={14} />} title={lk === "fr" ? "Supprimer" : "Delete"} variant="danger" onClick={function () { setConfirmDelete(idx); }} />
            </div>
          );
        },
      },
    ];
  }, [channels, enabledChannels, totalBudget, totalConversions, lk]);

  var platformOptions = CHANNEL_KEYS.map(function (k) {
    return { value: k, label: CHANNEL_META[k].label[lk] };
  });

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <KpiCard label={lk === "fr" ? "Budget total/mois" : "Total budget/mo"} value={eurShort(totalBudget)} fullValue={eur(totalBudget)} />
        <KpiCard label={lk === "fr" ? "CAC moyen" : "Avg CAC"} value={totalConversions > 0 ? eurShort(avgCac) : "—"} fullValue={totalConversions > 0 ? eur(avgCac) : undefined} glossaryKey="cac" />
        <KpiCard label={lk === "fr" ? "ROAS moyen" : "Avg ROAS"} value={avgRoas > 0 ? avgRoas.toFixed(1) + "x" : "—"} glossaryKey="roas" />
        <KpiCard label={lk === "fr" ? "Canaux actifs" : "Active channels"} value={String(activeCount)} />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder={lk === "fr" ? "Rechercher un canal..." : "Search a channel..."} />
        <div style={{ flex: 1 }} />
        <ExportButtons columns={columns} data={filtered} filename="marketing-channels" />
        <DevOptionsButton
          onRandomize={function () {
            var demo = [];
            ["meta", "google", "linkedin", "tiktok", "seo"].forEach(function (k) {
              var m = CHANNEL_META[k];
              demo.push({
                id: makeId("mch"), platform: k, enabled: true,
                monthlyBudget: Math.round((200 + Math.random() * 1800) / 50) * 50,
                cpc: m.defaultCpc * (0.7 + Math.random() * 0.6),
                ctr: m.defaultCtr * (0.8 + Math.random() * 0.4),
                conversionRate: m.defaultConvRate * (0.7 + Math.random() * 0.6),
                avgOrderValue: m.defaultAov * (0.8 + Math.random() * 0.4),
              });
            });
            setChannelsData(demo);
          }}
          onClear={function () { setChannelsData([]); }}
        />
        <Button color="primary" size="sm" icon={<Plus size={16} />} onClick={openAdd}>
          {lk === "fr" ? "Ajouter" : "Add"}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={filtered} emptyLabel={lk === "fr" ? "Aucun canal configuré" : "No channels configured"} showFooter />

      {/* Budget DonutChart */}
      {Object.keys(budgetDistribution).length > 1 ? (
        <Card sx={{ padding: "var(--sp-4)", marginTop: "var(--gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lk === "fr" ? "Répartition du budget" : "Budget breakdown"}
            </div>
            <PaletteToggle value={chartPaletteMode} onChange={onChartPaletteChange} accentRgb={accentRgb} />
          </div>
          <ChartLegend palette={chartPalette} distribution={budgetDistribution} meta={channelMeta} total={totalBudget} lk={lk}>
            <DonutChart data={budgetDistribution} palette={chartPalette} />
          </ChartLegend>
        </Card>
      ) : null}

      {/* Channel Modal */}
      <Modal open={modalOpen} onClose={function () { setModalOpen(false); }} size="md"
        title={editIdx >= 0 ? (lk === "fr" ? "Modifier le canal" : "Edit channel") : (lk === "fr" ? "Ajouter un canal" : "Add channel")}
        icon={<Crosshair size={20} weight="duotone" />}
      >
        <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <div>
            <label style={labelStyle}>{lk === "fr" ? "Plateforme" : "Platform"}</label>
            <SelectDropdown value={form.platform || "meta"} onChange={function (v) { onPlatformChange(v); }}
              options={platformOptions} width="100%" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Budget mensuel" : "Monthly budget"}</label>
              <CurrencyInput value={form.monthlyBudget || 0} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { monthlyBudget: v }); }); }} suffix="€" width="100%" />
            </div>
            <div>
              <label style={labelStyle}>CPC</label>
              <CurrencyInput value={form.cpc || 0} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { cpc: v }); }); }} suffix="€" width="100%" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <div>
              <label style={labelStyle}>CTR (%)</label>
              <NumberField value={((form.ctr || 0) * 100)} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { ctr: v / 100 }); }); }} suffix="%" width="100%" />
            </div>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Taux de conversion (%)" : "Conversion rate (%)"}</label>
              <NumberField value={((form.conversionRate || 0) * 100)} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { conversionRate: v / 100 }); }); }} suffix="%" width="100%" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{lk === "fr" ? "Panier moyen" : "Avg order value"}</label>
            <CurrencyInput value={form.avgOrderValue || 0} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { avgOrderValue: v }); }); }} suffix="€" width="100%" />
          </div>
        </div>
        <ModalFooter>
          <Button onClick={function () { setModalOpen(false); }}>{lk === "fr" ? "Annuler" : "Cancel"}</Button>
          <Button color="primary" onClick={saveChannel}>{editIdx >= 0 ? (lk === "fr" ? "Enregistrer" : "Save") : (lk === "fr" ? "Ajouter" : "Add")}</Button>
        </ModalFooter>
      </Modal>

      {confirmDelete !== null ? (
        <ConfirmDeleteModal
          onConfirm={function () { removeChannel(confirmDelete); }}
          onCancel={function () { setConfirmDelete(null); }}
          t={{ confirm_delete_title: lk === "fr" ? "Supprimer ce canal ?" : "Delete this channel?", confirm_delete_msg: lk === "fr" ? "Cette action est irréversible." : "This action cannot be undone.", confirm_delete_yes: lk === "fr" ? "Supprimer" : "Delete", confirm_delete_no: lk === "fr" ? "Annuler" : "Cancel" }}
        />
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CAMPAIGNS TAB
   ────────────────────────────────────────────────────────────── */
function CampaignsTab({ campaigns, setCampaignsData, channels, lk }) {
  var [search, setSearch] = useState("");
  var [statusFilter, setStatusFilter] = useState("");
  var [channelFilter, setChannelFilter] = useState("");
  var [modalOpen, setModalOpen] = useState(false);
  var [editIdx, setEditIdx] = useState(-1);
  var [form, setForm] = useState({});
  var [confirmDelete, setConfirmDelete] = useState(null);

  var channelMap = useMemo(function () {
    var map = {};
    (channels || []).forEach(function (ch) { map[ch.id] = ch; });
    return map;
  }, [channels]);

  var filtered = useMemo(function () {
    var items = campaigns || [];
    if (statusFilter) items = items.filter(function (c) { return c.status === statusFilter; });
    if (channelFilter) items = items.filter(function (c) { return c.channelId === channelFilter; });
    if (search) {
      var q = search.toLowerCase();
      items = items.filter(function (c) { return (c.name || "").toLowerCase().indexOf(q) >= 0; });
    }
    return items;
  }, [campaigns, statusFilter, channelFilter, search]);

  function openAdd() {
    setEditIdx(-1);
    setForm({ name: "", channelId: (channels && channels.length > 0) ? channels[0].id : "", objective: "conversion", startDate: new Date().toISOString().slice(0, 10), endDate: "", budget: 500, status: "draft" });
    setModalOpen(true);
  }

  function openEdit(idx) {
    var original = (campaigns || [])[idx];
    setEditIdx(idx);
    setForm(Object.assign({}, original));
    setModalOpen(true);
  }

  function saveCampaign() {
    var next = (campaigns || []).slice();
    if (editIdx >= 0) {
      next[editIdx] = Object.assign({}, next[editIdx], form);
    } else {
      next.push(Object.assign({ id: makeId("mcp") }, form));
    }
    setCampaignsData(next);
    setModalOpen(false);
  }

  function removeCampaign(idx) {
    var next = (campaigns || []).slice();
    next.splice(idx, 1);
    setCampaignsData(next);
    setConfirmDelete(null);
  }

  var statusOptions = [{ value: "", label: lk === "fr" ? "Tous les statuts" : "All statuses" }].concat(
    Object.keys(STATUS_META).map(function (k) { return { value: k, label: STATUS_META[k].label[lk] }; })
  );

  var channelFilterOptions = [{ value: "", label: lk === "fr" ? "Tous les canaux" : "All channels" }].concat(
    (channels || []).map(function (ch) {
      var m = CHANNEL_META[ch.platform];
      return { value: ch.id, label: m ? m.label[lk] : ch.platform };
    })
  );

  var channelSelectOptions = (channels || []).map(function (ch) {
    var m = CHANNEL_META[ch.platform];
    return { value: ch.id, label: m ? m.label[lk] : ch.platform };
  });

  var objectiveOptions = Object.keys(OBJECTIVE_META).map(function (k) {
    return { value: k, label: OBJECTIVE_META[k].label[lk] };
  });

  var statusSelectOptions = Object.keys(STATUS_META).map(function (k) {
    return { value: k, label: STATUS_META[k].label[lk] };
  });

  var columns = useMemo(function () {
    return [
      {
        id: "name", accessorKey: "name",
        header: lk === "fr" ? "Nom" : "Name",
        enableSorting: true, meta: { align: "left", minWidth: 160, grow: true },
        cell: function (info) { return info.getValue() || "—"; },
      },
      {
        id: "channel", header: lk === "fr" ? "Canal" : "Channel",
        enableSorting: true, meta: { align: "left" },
        accessorFn: function (row) {
          var ch = channelMap[row.channelId];
          if (!ch) return "";
          var m = CHANNEL_META[ch.platform];
          return m ? m.label[lk] : ch.platform;
        },
        cell: function (info) {
          var row = info.row.original;
          var ch = channelMap[row.channelId];
          if (!ch) return <span style={{ color: "var(--text-faint)" }}>—</span>;
          var m = CHANNEL_META[ch.platform];
          return m ? <Badge color={m.badge} size="sm">{m.label[lk]}</Badge> : ch.platform;
        },
      },
      {
        id: "objective", header: lk === "fr" ? "Objectif" : "Objective",
        enableSorting: true, meta: { align: "left" },
        accessorFn: function (row) { var o = OBJECTIVE_META[row.objective]; return o ? o.label[lk] : row.objective; },
        cell: function (info) {
          var row = info.row.original;
          var o = OBJECTIVE_META[row.objective];
          return o ? <Badge color={o.badge} size="sm">{o.label[lk]}</Badge> : row.objective;
        },
      },
      {
        id: "dates", header: lk === "fr" ? "Dates" : "Dates",
        enableSorting: true, meta: { align: "left" },
        accessorFn: function (row) { return row.startDate || ""; },
        cell: function (info) {
          var row = info.row.original;
          var s = row.startDate || "—";
          var e = row.endDate || "...";
          return <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{s + " → " + e}</span>;
        },
      },
      {
        id: "budget", header: "Budget",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.budget || 0; },
        cell: function (info) { return eur(info.getValue()); },
      },
      {
        id: "status", header: lk === "fr" ? "Statut" : "Status",
        enableSorting: true, meta: { align: "center" },
        accessorFn: function (row) { var s = STATUS_META[row.status]; return s ? s.label[lk] : row.status; },
        cell: function (info) {
          var row = info.row.original;
          var s = STATUS_META[row.status];
          return s ? <Badge color={s.badge} size="sm" dot>{s.label[lk]}</Badge> : row.status;
        },
      },
      {
        id: "actions", header: "",
        enableSorting: false, meta: { align: "center", compactPadding: true, width: 1 },
        cell: function (info) {
          var idx = info.row.index;
          return (
            <div style={{ display: "flex", gap: 4 }}>
              <ActionBtn icon={<PencilSimple size={14} />} title={lk === "fr" ? "Modifier" : "Edit"} onClick={function () { openEdit(idx); }} />
              <ActionBtn icon={<Trash size={14} />} title={lk === "fr" ? "Supprimer" : "Delete"} variant="danger" onClick={function () { setConfirmDelete(idx); }} />
            </div>
          );
        },
      },
    ];
  }, [campaigns, channelMap, lk]);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder={lk === "fr" ? "Rechercher..." : "Search..."} />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        <FilterDropdown value={channelFilter} onChange={setChannelFilter} options={channelFilterOptions} />
        <div style={{ flex: 1 }} />
        <ExportButtons columns={columns} data={filtered} filename="marketing-campaigns" />
        <Button color="primary" size="sm" icon={<Plus size={16} />} onClick={openAdd}>
          {lk === "fr" ? "Ajouter" : "Add"}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={filtered} emptyLabel={lk === "fr" ? "Aucune campagne" : "No campaigns"} />

      {/* Campaign Modal */}
      <Modal open={modalOpen} onClose={function () { setModalOpen(false); }} size="md"
        title={editIdx >= 0 ? (lk === "fr" ? "Modifier la campagne" : "Edit campaign") : (lk === "fr" ? "Nouvelle campagne" : "New campaign")}
        icon={<Megaphone size={20} weight="duotone" />}
      >
        <div style={{ padding: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <div>
            <label style={labelStyle}>{lk === "fr" ? "Nom de la campagne" : "Campaign name"}</label>
            <input type="text" value={form.name || ""} onChange={function (e) { setForm(function (p) { return Object.assign({}, p, { name: e.target.value }); }); }}
              placeholder={lk === "fr" ? "Ex: Campagne été 2026" : "E.g. Summer 2026 campaign"}
              style={{ width: "100%", height: 40, border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "0 var(--sp-3)", fontSize: 13, fontFamily: "inherit", background: "var(--bg-card)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Canal" : "Channel"}</label>
              <SelectDropdown value={form.channelId || ""} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { channelId: v }); }); }}
                options={channelSelectOptions} placeholder={lk === "fr" ? "Sélectionner..." : "Select..."} width="100%" />
            </div>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Objectif" : "Objective"}</label>
              <SelectDropdown value={form.objective || "conversion"} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { objective: v }); }); }}
                options={objectiveOptions} width="100%" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Date de début" : "Start date"}</label>
              <DatePicker value={form.startDate || ""} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { startDate: v }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Date de fin" : "End date"}</label>
              <DatePicker value={form.endDate || ""} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { endDate: v }); }); }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <div>
              <label style={labelStyle}>Budget</label>
              <CurrencyInput value={form.budget || 0} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { budget: v }); }); }} suffix="€" width="100%" />
            </div>
            <div>
              <label style={labelStyle}>{lk === "fr" ? "Statut" : "Status"}</label>
              <SelectDropdown value={form.status || "draft"} onChange={function (v) { setForm(function (p) { return Object.assign({}, p, { status: v }); }); }}
                options={statusSelectOptions} width="100%" />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button onClick={function () { setModalOpen(false); }}>{lk === "fr" ? "Annuler" : "Cancel"}</Button>
          <Button color="primary" onClick={saveCampaign} disabled={!(form.name || "").trim()}>
            {editIdx >= 0 ? (lk === "fr" ? "Enregistrer" : "Save") : (lk === "fr" ? "Ajouter" : "Add")}
          </Button>
        </ModalFooter>
      </Modal>

      {confirmDelete !== null ? (
        <ConfirmDeleteModal
          onConfirm={function () { removeCampaign(confirmDelete); }}
          onCancel={function () { setConfirmDelete(null); }}
          t={{ confirm_delete_title: lk === "fr" ? "Supprimer cette campagne ?" : "Delete this campaign?", confirm_delete_msg: lk === "fr" ? "Cette action est irréversible." : "This action cannot be undone.", confirm_delete_yes: lk === "fr" ? "Supprimer" : "Delete", confirm_delete_no: lk === "fr" ? "Annuler" : "Cancel" }}
        />
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   BUDGET TAB
   ────────────────────────────────────────────────────────────── */
function BudgetTab({ channels, totalRevenue, lk, chartPalette, chartPaletteMode, onChartPaletteChange, accentRgb }) {
  var enabledChannels = (channels || []).filter(function (ch) { return ch.enabled !== false && (ch.monthlyBudget || 0) > 0; });

  var totalBudgetMonthly = 0;
  enabledChannels.forEach(function (ch) { totalBudgetMonthly += ch.monthlyBudget || 0; });
  var totalBudgetAnnual = totalBudgetMonthly * 12;
  var pctOfRevenue = totalRevenue > 0 ? totalBudgetAnnual / totalRevenue : 0;

  var budgetDistribution = useMemo(function () {
    var dist = {};
    enabledChannels.forEach(function (ch) {
      var m = CHANNEL_META[ch.platform];
      var label = m ? m.label[lk] : ch.platform;
      dist[label] = (dist[label] || 0) + (ch.monthlyBudget || 0);
    });
    return dist;
  }, [enabledChannels, lk]);

  var channelMeta = useMemo(function () {
    var meta = {};
    enabledChannels.forEach(function (ch) {
      var m = CHANNEL_META[ch.platform];
      if (m) {
        var label = m.label[lk];
        meta[label] = { label: { fr: label, en: label }, badge: m.badge };
      }
    });
    return meta;
  }, [enabledChannels, lk]);

  var summaryColumns = useMemo(function () {
    return [
      {
        id: "channel", header: lk === "fr" ? "Canal" : "Channel",
        enableSorting: true, meta: { align: "left", minWidth: 140, grow: true },
        accessorFn: function (row) { return row.label; },
        cell: function (info) {
          var row = info.row.original;
          var m = CHANNEL_META[row.platform];
          return m ? <Badge color={m.badge} size="sm" dot>{row.label}</Badge> : row.label;
        },
        footer: function () { return <span style={{ fontWeight: 600 }}>Total</span>; },
      },
      {
        id: "budget", header: lk === "fr" ? "Budget/mois" : "Budget/mo",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.monthlyBudget; },
        cell: function (info) { return eur(info.getValue()); },
        footer: function () { return <span style={{ fontWeight: 600 }}>{eur(totalBudgetMonthly)}</span>; },
      },
      {
        id: "pct", header: "% Total",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return totalBudgetMonthly > 0 ? row.monthlyBudget / totalBudgetMonthly : 0; },
        cell: function (info) { return pct(info.getValue()); },
        footer: function () { return <span style={{ fontWeight: 600 }}>100%</span>; },
      },
      {
        id: "cac", header: "CAC",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) {
          var clicks = safeDiv(row.monthlyBudget, row.cpc || 1);
          var conv = clicks * (row.conversionRate || 0);
          return conv > 0 ? row.monthlyBudget / conv : Infinity;
        },
        cell: function (info) {
          var v = info.getValue();
          return isFinite(v) ? eur(v) : <span style={{ color: "var(--text-faint)" }}>—</span>;
        },
      },
      {
        id: "roas", header: "ROAS",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) {
          var clicks = safeDiv(row.monthlyBudget, row.cpc || 1);
          var conv = clicks * (row.conversionRate || 0);
          var rev = conv * (row.avgOrderValue || 0);
          return safeDiv(rev, row.monthlyBudget);
        },
        cell: function (info) {
          var v = info.getValue();
          return v > 0 ? v.toFixed(1) + "x" : <span style={{ color: "var(--text-faint)" }}>—</span>;
        },
      },
    ];
  }, [enabledChannels, totalBudgetMonthly, lk]);

  var summaryData = useMemo(function () {
    return enabledChannels.map(function (ch) {
      var m = CHANNEL_META[ch.platform];
      return {
        platform: ch.platform,
        label: m ? m.label[lk] : ch.platform,
        monthlyBudget: ch.monthlyBudget || 0,
        cpc: ch.cpc || 0,
        conversionRate: ch.conversionRate || 0,
        avgOrderValue: ch.avgOrderValue || 0,
      };
    });
  }, [enabledChannels, lk]);

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <KpiCard label={lk === "fr" ? "Budget mensuel total" : "Total monthly budget"} value={eurShort(totalBudgetMonthly)} fullValue={eur(totalBudgetMonthly)} />
        <KpiCard label={lk === "fr" ? "Budget annuel" : "Annual budget"} value={eurShort(totalBudgetAnnual)} fullValue={eur(totalBudgetAnnual)} />
        <KpiCard label={lk === "fr" ? "% du chiffre d'affaires" : "% of revenue"} value={totalRevenue > 0 ? pct(pctOfRevenue) : "—"} />
      </div>

      {/* DonutChart */}
      {Object.keys(budgetDistribution).length > 1 ? (
        <Card sx={{ padding: "var(--sp-4)", marginBottom: "var(--gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lk === "fr" ? "Répartition du budget par canal" : "Budget breakdown by channel"}
            </div>
            <PaletteToggle value={chartPaletteMode} onChange={onChartPaletteChange} accentRgb={accentRgb} />
          </div>
          <ChartLegend palette={chartPalette} distribution={budgetDistribution} meta={channelMeta} total={totalBudgetMonthly} lk={lk}>
            <DonutChart data={budgetDistribution} palette={chartPalette} />
          </ChartLegend>
        </Card>
      ) : null}

      {/* Summary table */}
      <DataTable columns={summaryColumns} data={summaryData} emptyLabel={lk === "fr" ? "Aucun canal avec budget" : "No channels with budget"} showFooter />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CONVERSIONS TAB
   ────────────────────────────────────────────────────────────── */
function ConversionsTab({ channels, lk }) {
  var enabledChannels = (channels || []).filter(function (ch) { return ch.enabled !== false && (ch.monthlyBudget || 0) > 0; });

  /* Aggregate funnel */
  var totalBudget = 0;
  var totalClicks = 0;
  var totalConversions = 0;
  var totalConvRevenue = 0;
  var totalImpressions = 0;

  enabledChannels.forEach(function (ch) {
    var b = ch.monthlyBudget || 0;
    var cpc = ch.cpc || 1;
    var ctr = ch.ctr || 0.02;
    var convRate = ch.conversionRate || 0;
    var aov = ch.avgOrderValue || 0;

    totalBudget += b;
    var clicks = safeDiv(b, cpc);
    totalClicks += clicks;
    var impressions = ctr > 0 ? clicks / ctr : 0;
    totalImpressions += impressions;
    var conv = clicks * convRate;
    totalConversions += conv;
    totalConvRevenue += conv * aov;
  });

  var avgCac = safeDiv(totalBudget, totalConversions);
  var avgRoas = safeDiv(totalConvRevenue, totalBudget);
  var costPerConv = safeDiv(totalBudget, totalConversions);

  /* Funnel steps */
  var funnelSteps = [
    { label: lk === "fr" ? "Impressions" : "Impressions", value: Math.round(totalImpressions) },
    { label: lk === "fr" ? "Clics" : "Clicks", value: Math.round(totalClicks) },
    { label: "Conversions", value: Math.round(totalConversions) },
    { label: lk === "fr" ? "Revenu" : "Revenue", value: totalConvRevenue, isCurrency: true },
  ];

  /* Per-channel comparison table sorted by ROAS desc */
  var channelRows = useMemo(function () {
    return enabledChannels.map(function (ch) {
      var m = CHANNEL_META[ch.platform];
      var b = ch.monthlyBudget || 0;
      var cpc = ch.cpc || 1;
      var ctr = ch.ctr || 0.02;
      var convRate = ch.conversionRate || 0;
      var aov = ch.avgOrderValue || 0;

      var clicks = safeDiv(b, cpc);
      var impressions = ctr > 0 ? clicks / ctr : 0;
      var conv = clicks * convRate;
      var rev = conv * aov;
      var roas = safeDiv(rev, b);
      var cac = safeDiv(b, conv);

      return {
        platform: ch.platform,
        label: m ? m.label[lk] : ch.platform,
        badge: m ? m.badge : "gray",
        impressions: Math.round(impressions),
        clicks: Math.round(clicks),
        ctr: ctr,
        conversions: Math.round(conv),
        convRate: convRate,
        cac: cac,
        roas: roas,
      };
    }).sort(function (a, b) { return b.roas - a.roas; });
  }, [enabledChannels, lk]);

  var comparisonColumns = useMemo(function () {
    return [
      {
        id: "channel", header: lk === "fr" ? "Canal" : "Channel",
        enableSorting: true, meta: { align: "left", minWidth: 140, grow: true },
        accessorFn: function (row) { return row.label; },
        cell: function (info) {
          var row = info.row.original;
          return <Badge color={row.badge} size="sm" dot>{row.label}</Badge>;
        },
      },
      {
        id: "impressions", header: lk === "fr" ? "Impressions" : "Impressions",
        enableSorting: true, meta: { align: "right", rawNumber: true },
        accessorFn: function (row) { return row.impressions; },
        cell: function (info) { return String(info.getValue()); },
      },
      {
        id: "clicks", header: lk === "fr" ? "Clics" : "Clicks",
        enableSorting: true, meta: { align: "right", rawNumber: true },
        accessorFn: function (row) { return row.clicks; },
        cell: function (info) { return String(info.getValue()); },
      },
      {
        id: "ctr", header: "CTR",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.ctr; },
        cell: function (info) { return pct(info.getValue()); },
      },
      {
        id: "conversions", header: "Conv.",
        enableSorting: true, meta: { align: "right", rawNumber: true },
        accessorFn: function (row) { return row.conversions; },
        cell: function (info) { return <span style={{ fontWeight: 600, color: "var(--brand)" }}>{String(info.getValue())}</span>; },
      },
      {
        id: "convRate", header: lk === "fr" ? "Taux conv." : "Conv. rate",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.convRate; },
        cell: function (info) { return pct(info.getValue()); },
      },
      {
        id: "cac", header: "CAC",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.cac; },
        cell: function (info) {
          var v = info.getValue();
          return isFinite(v) && v > 0 ? eur(v) : <span style={{ color: "var(--text-faint)" }}>—</span>;
        },
      },
      {
        id: "roas", header: "ROAS",
        enableSorting: true, meta: { align: "right" },
        accessorFn: function (row) { return row.roas; },
        cell: function (info) {
          var v = info.getValue();
          var color = v >= 3 ? "var(--color-success)" : v >= 1 ? "var(--color-warning)" : "var(--color-error)";
          return <span style={{ fontWeight: 700, color: color }}>{v > 0 ? v.toFixed(1) + "x" : "—"}</span>;
        },
      },
    ];
  }, [channelRows, lk]);

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <KpiCard label={lk === "fr" ? "CAC moyen" : "Avg CAC"} value={totalConversions > 0 ? eurShort(avgCac) : "—"} fullValue={totalConversions > 0 ? eur(avgCac) : undefined} glossaryKey="cac" />
        <KpiCard label={lk === "fr" ? "ROAS moyen" : "Avg ROAS"} value={avgRoas > 0 ? avgRoas.toFixed(1) + "x" : "—"} glossaryKey="roas" />
        <KpiCard label={lk === "fr" ? "Conversions/mois" : "Conversions/mo"} value={String(Math.round(totalConversions))} />
        <KpiCard label={lk === "fr" ? "Coût/conversion" : "Cost/conversion"} value={totalConversions > 0 ? eurShort(costPerConv) : "—"} fullValue={totalConversions > 0 ? eur(costPerConv) : undefined} />
      </div>

      {/* Funnel card */}
      <Card sx={{ padding: "var(--sp-4)", marginBottom: "var(--gap-md)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--sp-4)" }}>
          {lk === "fr" ? "Entonnoir d'acquisition" : "Acquisition funnel"}
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          {funnelSteps.map(function (step, i) {
            var prev = i > 0 ? funnelSteps[i - 1] : null;
            var dropOff = prev && prev.value > 0 && !prev.isCurrency && !step.isCurrency
              ? ((prev.value - step.value) / prev.value)
              : null;
            var widthPct = funnelSteps[0].value > 0 && !step.isCurrency
              ? Math.max(20, (step.value / funnelSteps[0].value) * 100)
              : 100;

            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {dropOff !== null ? (
                  <div style={{ position: "absolute", top: -18, left: -8, fontSize: 10, color: "var(--color-error)", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                    <ArrowDown size={10} />
                    {(dropOff * 100).toFixed(0) + "%"}
                  </div>
                ) : null}
                <div style={{
                  width: widthPct + "%", minHeight: 56,
                  background: i === 0 ? "var(--brand-bg)" : i === funnelSteps.length - 1 ? "var(--color-success-bg)" : "var(--bg-accordion)",
                  border: "1px solid " + (i === funnelSteps.length - 1 ? "var(--color-success-border)" : "var(--border-light)"),
                  borderRadius: "var(--r-md)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "var(--sp-2)",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    {step.isCurrency ? eurShort(step.value) : String(step.value)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{step.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Comparison DataTable */}
      <DataTable columns={comparisonColumns} data={channelRows} emptyLabel={lk === "fr" ? "Aucun canal actif" : "No active channels"} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────────────────── */
export default function MarketingPage({ marketing, setMarketing, cfg, activeTab, isPaid, isEnabled, onOpenModuleSettings, costs, setCosts, streams, chartPalette, chartPaletteMode, onChartPaletteChange, accentRgb }) {
  var t = useT();
  var { lang } = useLang();
  var lk = lang === "en" ? "en" : "fr";
  var modulePaid = isPaid === true;
  var moduleEnabled = isEnabled === true;

  /* Derived state from marketing object */
  var mktChannels = marketing.channelData || [];
  var mktCampaigns = marketing.campaigns || [];

  /* Revenue from streams for Budget tab */
  var annualRevenue = useMemo(function () {
    return calcTotalRevenue(streams);
  }, [streams]);

  function handleWizardFinish(data) {
    /* Build channel data from wizard selections */
    var channelData = data.channels.map(function (platform) {
      var m = CHANNEL_META[platform];
      var share = data.channels.length > 0 ? Math.round(data.budget / data.channels.length) : 0;
      return {
        id: makeId("mch"), platform: platform, enabled: true,
        monthlyBudget: share,
        cpc: m ? m.defaultCpc : 1,
        ctr: m ? m.defaultCtr : 0.02,
        conversionRate: m ? m.defaultConvRate : 0.03,
        avgOrderValue: m ? m.defaultAov : 50,
      };
    });

    setMarketing(function (prev) {
      return Object.assign({}, prev, {
        showWizard: false,
        channels: data.channels,
        budget: data.budget,
        channelData: channelData,
        campaigns: [],
      });
    });
  }

  function setChannelsData(nextChannels) {
    setMarketing(function (prev) {
      return Object.assign({}, prev, { channelData: nextChannels });
    });
  }

  function setCampaignsData(nextCampaigns) {
    setMarketing(function (prev) {
      return Object.assign({}, prev, { campaigns: nextCampaigns });
    });
  }

  /* ── Auto-link marketing channels to operating costs ── */
  useEffect(function () {
    if (!moduleEnabled || !setCosts) return;

    var enabledChannels = (mktChannels || []).filter(function (ch) {
      return ch.enabled !== false && (ch.monthlyBudget || 0) > 0;
    });

    setCosts(function (prev) {
      var cats = (prev || []).map(function (cat) {
        /* Remove orphaned marketing links */
        var filtered = (cat.items || []).filter(function (c) {
          if (!c._linkedMarketing) return true;
          return enabledChannels.some(function (ch) { return ch.id === c._linkedMarketing; });
        });
        /* Update existing linked items */
        var updated = filtered.map(function (c) {
          if (!c._linkedMarketing) return c;
          var ch = null;
          enabledChannels.forEach(function (ec) { if (ec.id === c._linkedMarketing) ch = ec; });
          if (!ch) return c;
          var m = CHANNEL_META[ch.platform];
          var label = m ? m.label[lk] : ch.platform;
          return Object.assign({}, c, {
            l: "Pub — " + label,
            a: Math.round(ch.monthlyBudget * 100) / 100,
            freq: "monthly", pcmn: "6130",
            _readOnly: true, _linkedPage: "marketing",
          });
        });
        return Object.assign({}, cat, { items: updated });
      });

      /* Add new linked items for channels that don't have a match yet */
      enabledChannels.forEach(function (ch) {
        var found = false;
        cats.forEach(function (cat) {
          (cat.items || []).forEach(function (c) {
            if (c._linkedMarketing === ch.id) found = true;
          });
        });
        if (!found && cats.length > 0) {
          var m = CHANNEL_META[ch.platform];
          var label = m ? m.label[lk] : ch.platform;
          cats[0] = Object.assign({}, cats[0], {
            items: (cats[0].items || []).concat([{
              id: makeId("cost"),
              l: "Pub — " + label,
              a: Math.round(ch.monthlyBudget * 100) / 100,
              freq: "monthly", pcmn: "6130", pu: false, u: 1,
              _linkedMarketing: ch.id, _readOnly: true, _linkedPage: "marketing",
            }]),
          });
        }
      });

      return cats;
    });
  }, [mktChannels, moduleEnabled, lk]);

  /* ── Paywall ── */
  if (!modulePaid) {
    var features = lk === "fr"
      ? [
          "Gérez votre budget pub sur Facebook, Google, LinkedIn et TikTok",
          "Voyez combien vous coûte chaque nouveau client",
          "Comparez ce que vous dépensez à ce que ça vous rapporte",
          "Vos dépenses marketing sont ajoutées automatiquement à vos charges",
          "Guides pratiques pour Meta Business et Google Analytics",
          "Estimez combien de temps un client reste et ce qu'il rapporte",
        ]
      : [
          "Manage your ad budget on Facebook, Google, LinkedIn and TikTok",
          "See how much each new customer costs you",
          "Compare what you spend to what it brings in",
          "Your marketing spend is automatically added to your costs",
          "Practical guides for Meta Business and Google Analytics",
          "Estimate how long a customer stays and what they're worth",
        ];

    return (
      <PageLayout
        title={lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
        subtitle={lk === "fr" ? "Planifiez et optimisez votre budget marketing par canal." : "Plan and optimize your marketing budget per channel."}
        icon={Megaphone} iconColor="#3B82F6"
      >
        <ModulePaywall
          preview={<FakePreview lang={lang} />}
          moduleId="marketing"
          icon={Megaphone}
          title={lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
          subtitle={lk === "fr" ? "Planifiez combien vous investissez en publicité et voyez ce que ça vous rapporte concrètement." : "Plan how much you invest in advertising and see what it actually brings you."}
          features={features}
          ctaDisabled={true}
          ctaLabel={lk === "fr" ? "Plan Paid requis" : "Paid plan required"}
          price={lk === "fr" ? "Accès réservé aux comptes payants" : "Available to paid accounts only"}
        />
      </PageLayout>
    );
  }

  if (!moduleEnabled) {
    return (
      <PageLayout
        title={lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
        subtitle={lk === "fr" ? "Le module est disponible sur votre compte, mais il n'est pas encore actif." : "This module is available on your account, but it is not active yet."}
        icon={Megaphone} iconColor="#3B82F6"
      >
        <Card sx={{ padding: "var(--sp-6)", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <Megaphone size={56} weight="duotone" color="var(--brand)" style={{ marginBottom: "var(--sp-3)" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--sp-2)" }}>
            {lk === "fr" ? "Activez le module dans les paramètres" : "Enable the module in Settings"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "var(--sp-5)" }}>
            {lk === "fr"
              ? "Le module Marketing est bien associé à votre compte. Pour l'afficher dans la navigation et accéder à ses pages, activez-le depuis Paramètres > Modules."
              : "The Marketing module is available on your account. To show it in navigation and access its pages, enable it from Settings > Modules."}
          </div>
          <Button color="primary" size="lg" onClick={onOpenModuleSettings}>
            {lk === "fr" ? "Ouvrir Paramètres > Modules" : "Open Settings > Modules"}
          </Button>
        </Card>
      </PageLayout>
    );
  }

  if (marketing.showWizard) {
    return (
      <PageLayout
        title={lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
        subtitle={lk === "fr" ? "Configurez votre module marketing." : "Set up your marketing module."}
        icon={Megaphone} iconColor="#3B82F6"
      >
        <MarketingWizard onFinish={handleWizardFinish} lang={lang} />
      </PageLayout>
    );
  }

  /* ── Active tab subtitles ── */
  var subtitles = {
    marketing: lk === "fr" ? "Gérez vos canaux d'acquisition et leurs performances." : "Manage your acquisition channels and their performance.",
    mkt_channels: lk === "fr" ? "Gérez vos canaux d'acquisition et leurs performances." : "Manage your acquisition channels and their performance.",
    mkt_campaigns: lk === "fr" ? "Planifiez et suivez vos campagnes marketing." : "Plan and track your marketing campaigns.",
    mkt_budget: lk === "fr" ? "Répartition et suivi de votre budget marketing." : "Breakdown and tracking of your marketing budget.",
    mkt_conversions: lk === "fr" ? "Analysez votre entonnoir de conversion par canal." : "Analyze your conversion funnel by channel.",
  };

  var currentTab = activeTab || "marketing";
  var subtitle = subtitles[currentTab] || subtitles.marketing;

  return (
    <PageLayout
      title={lk === "fr" ? "Marketing & Acquisition" : "Marketing & Acquisition"}
      subtitle={subtitle}
      icon={Megaphone} iconColor="#3B82F6"
    >
      {currentTab === "marketing" || currentTab === "mkt_channels" ? (
        <ChannelsTab
          channels={mktChannels} setChannelsData={setChannelsData} lk={lk}
          chartPalette={chartPalette} chartPaletteMode={chartPaletteMode}
          onChartPaletteChange={onChartPaletteChange} accentRgb={accentRgb}
        />
      ) : null}

      {currentTab === "mkt_campaigns" ? (
        <CampaignsTab
          campaigns={mktCampaigns} setCampaignsData={setCampaignsData}
          channels={mktChannels} lk={lk}
        />
      ) : null}

      {currentTab === "mkt_budget" ? (
        <BudgetTab
          channels={mktChannels} totalRevenue={annualRevenue} lk={lk}
          chartPalette={chartPalette} chartPaletteMode={chartPaletteMode}
          onChartPaletteChange={onChartPaletteChange} accentRgb={accentRgb}
        />
      ) : null}

      {currentTab === "mkt_conversions" ? (
        <ConversionsTab channels={mktChannels} lk={lk} />
      ) : null}
    </PageLayout>
  );
}
