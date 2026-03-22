import { useState, useMemo } from "react";
import { ok, err } from "../constants/colors";
import { NumberField, PageLayout, KpiCard, FinanceLink } from "../components";
import CurrencyInput from "../components/CurrencyInput";
import { eur, pct, projectFinancials } from "../utils";
import { useT, useLang } from "../context";

/* ── Projection Chart (SVG) ── */
function ProjectionChart({ rows }) {
  if (!rows || rows.length === 0) return null;

  var months = rows.length;
  var revPts = rows.map(function (r) { return r.monthlyRevenue; });
  var costPts = rows.map(function (r) { return r.monthlyCosts; });
  var cumPts = rows.map(function (r) { return r.cumulative; });

  var allVals = revPts.concat(costPts).concat(cumPts);
  var peak = Math.max.apply(null, allVals);
  var trough = Math.min.apply(null, allVals);
  if (peak === trough) { peak += 1; trough -= 1; }
  var range = peak - trough;

  var W = 700, H = 220, pL = 64, pR = 20, pT = 12, pB = 32;
  var cW = W - pL - pR, cH = H - pT - pB;
  function xp(m) { return pL + (m / months) * cW; }
  function yp(v) { return pT + cH * (1 - (v - trough) / range); }

  function makePath(pts) {
    return pts.map(function (v, m) { return (m === 0 ? "M" : "L") + xp(m).toFixed(1) + " " + yp(v).toFixed(1); }).join(" ");
  }

  var zeroY = yp(0);
  var showZero = zeroY >= pT && zeroY <= pT + cH;

  function fmtY(v) {
    var abs = Math.abs(v);
    var sign = v < 0 ? "-" : "";
    if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + "M";
    if (abs >= 1000) return sign + Math.round(abs / 1000) + "k";
    return sign + Math.round(abs);
  }

  var yTicks = 5;
  var yStep = range / yTicks;

  return (
    <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto" }}>
      {Array.from({ length: yTicks + 1 }).map(function (_, i) {
        var val = trough + yStep * i;
        var y = yp(val);
        return (
          <g key={i}>
            <line x1={pL} x2={W - pR} y1={y} y2={y} stroke="var(--border-light)" strokeWidth={1} />
            <text x={pL - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--text-ghost)" fontFamily="'DM Sans',sans-serif">{fmtY(val)}</text>
          </g>
        );
      })}
      {showZero ? <line x1={pL} x2={W - pR} y1={zeroY} y2={zeroY} stroke="var(--border-strong)" strokeWidth={1} strokeDasharray="4,3" /> : null}
      {[12, 24, 36, 48].map(function (m) {
        if (m >= months) return null;
        return (
          <g key={m}>
            <line x1={xp(m)} x2={xp(m)} y1={pT} y2={H - pB} stroke="var(--border)" strokeWidth={1} strokeDasharray="3,3" />
            <text x={xp(m)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--text-faint)" fontFamily="'DM Sans',sans-serif">{"An " + (m / 12 + 1)}</text>
          </g>
        );
      })}
      <path d={makePath(cumPts) + " L" + xp(months - 1).toFixed(1) + " " + yp(0).toFixed(1) + " L" + xp(0).toFixed(1) + " " + yp(0).toFixed(1) + " Z"} fill="var(--brand)" fillOpacity={0.06} />
      <path d={makePath(revPts)} stroke="var(--color-success)" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={makePath(costPts)} stroke="var(--color-error)" strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray="4,3" />
      <path d={makePath(cumPts)} stroke="var(--brand)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── Main ── */
export default function CashFlowPage({ totalRevenue, monthlyCosts, annC, ebitda, cfg, setCfg, setTab }) {
  var tAll = useT();
  var t = tAll.cashflow || {};

  var [projYears, setProjYears] = useState(cfg.projectionYears || 3);

  var monthlyRev = totalRevenue / 12;
  var monthlyNet = monthlyRev - monthlyCosts;
  var isBurning = monthlyNet < 0;
  var initialCash = cfg.initialCash || 0;
  var runway = isBurning && initialCash > 0
    ? Math.floor(initialCash / Math.abs(monthlyNet))
    : null;

  var projY1 = initialCash + monthlyNet * 12;

  var proj = useMemo(function () {
    return projectFinancials({
      monthlyRevenue: monthlyRev,
      monthlyCosts: monthlyCosts,
      initialCash: initialCash,
      revenueGrowthRate: cfg.revenueGrowthRate || 0.10,
      costEscalation: cfg.costEscalation || 0.02,
      months: projYears * 12,
    });
  }, [monthlyRev, monthlyCosts, initialCash, cfg.revenueGrowthRate, cfg.costEscalation, projYears]);

  function cfgSet(key, val) {
    setCfg(function (prev) { var nc = Object.assign({}, prev); nc[key] = val; return nc; });
  }

  return (
    <PageLayout title={t.title || "Trésorerie"} subtitle={t.subtitle || "Projection des flux financiers."}>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <KpiCard label={t.kpi_initial || "Trésorerie initiale"} value={initialCash > 0 ? eur(initialCash) : "—"} />
        <KpiCard label={t.kpi_net || "Flux net mensuel"} value={eur(monthlyNet)} />
        <KpiCard label={t.kpi_runway || "Runway"} value={isBurning ? (runway !== null ? runway + " " + (t.kpi_runway_months || "mois") : "—") : (t.kpi_profitable || "Rentable")} />
        <KpiCard label={t.kpi_proj_y1 || "Trésorerie fin d'année"} value={eur(projY1)} />
      </div>

      {/* ── Insight cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>

        {/* Card: Paramètres */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: "var(--sp-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t.params_title || "Paramètres de projection"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.cash_initial || "Trésorerie initiale"}</span>
              <CurrencyInput value={initialCash} onChange={function (v) { cfgSet("initialCash", v); }} suffix="€" width="130px" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.proj_revenue_growth || "Croissance du CA"}</span>
              <NumberField value={cfg.revenueGrowthRate || 0.10} onChange={function (v) { cfgSet("revenueGrowthRate", v); }} min={-0.50} max={5} step={0.05} width="70px" pct />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.proj_cost_escalation || "Inflation des charges"}</span>
              <NumberField value={cfg.costEscalation || 0.02} onChange={function (v) { cfgSet("costEscalation", v); }} min={0} max={0.50} step={0.01} width="70px" pct />
            </div>
          </div>
        </div>

        {/* Card: Indicateurs */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: "var(--sp-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t.indicators_title || "Indicateurs"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {/* Horizon pills */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.horizon_label || "Horizon"}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 5].map(function (y) {
                  var active = projYears === y;
                  return (
                    <button key={y} onClick={function () { setProjYears(y); }} style={{
                      padding: "4px 12px", borderRadius: "var(--r-full)",
                      border: "1px solid " + (active ? "var(--brand)" : "var(--border)"),
                      background: active ? "var(--brand)" : "transparent",
                      color: active ? "var(--color-on-brand)" : "var(--text-secondary)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      transition: "all 150ms",
                    }}>
                      {typeof t.proj_year_btn === "function" ? t.proj_year_btn(y) : (y + " an" + (y > 1 ? "s" : ""))}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.status_label || "Statut"}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)",
                background: isBurning ? "var(--color-error-bg)" : "var(--color-success-bg)",
                color: isBurning ? "var(--color-error)" : "var(--color-success)",
                border: "1px solid " + (isBurning ? "var(--color-error-border)" : "var(--color-success-border)"),
              }}>
                {isBurning ? (t.status_burning || "En déficit") : (t.status_profitable || "Rentable")}
              </span>
            </div>
            {/* Break-even / Cash zero */}
            {proj.beMonth ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}><FinanceLink term="break_even">{t.be_label || "Seuil de rentabilité"}</FinanceLink></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-success)" }}>
                  {typeof t.proj_breakeven_short === "function" ? t.proj_breakeven_short(proj.beMonth) : ("Mois " + proj.beMonth)}
                </span>
              </div>
            ) : null}
            {proj.zeroMonth ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.zero_label || "Trésorerie à zéro"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-error)" }}>
                  {typeof t.proj_zero_short === "function" ? t.proj_zero_short(proj.zeroMonth) : ("Mois " + proj.zeroMonth)}
                </span>
              </div>
            ) : null}
            {/* Runway */}
            {isBurning && runway !== null ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}><FinanceLink term="runway">{t.runway_detail || "Runway"}</FinanceLink></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{runway} {t.kpi_runway_months || "mois"}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Chart legend ── */}
      <div style={{ display: "flex", gap: "var(--sp-5)", marginBottom: "var(--sp-2)" }}>
        {[
          { label: t.proj_legend_revenue || "Revenus", color: "var(--color-success)", dash: false },
          { label: t.proj_legend_costs || "Charges", color: "var(--color-error)", dash: true },
          { label: t.proj_legend_cash || "Trésorerie", color: "var(--brand)", dash: false },
        ].map(function (l, i) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 0, borderTop: "2px " + (l.dash ? "dashed" : "solid") + " " + l.color }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Projection Chart ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)", marginBottom: "var(--gap-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif" }}>
            {typeof t.proj_title === "function" ? t.proj_title(projYears) : ("Projection sur " + projYears + " ans")}
          </h3>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            {proj.zeroMonth ? (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)", background: "var(--color-error-bg)", color: "var(--color-error)", border: "1px solid var(--color-error-border)" }}>
                {typeof t.proj_cash_zero === "function" ? t.proj_cash_zero(proj.zeroMonth) : ("Cash à zéro : mois " + proj.zeroMonth)}
              </span>
            ) : null}
            {proj.beMonth ? (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--r-full)", background: "var(--color-success-bg)", color: "var(--color-success)", border: "1px solid var(--color-success-border)" }}>
                {typeof t.proj_breakeven === "function" ? t.proj_breakeven(proj.beMonth) : ("Rentable : mois " + proj.beMonth)}
              </span>
            ) : null}
          </div>
        </div>
        <ProjectionChart rows={proj.rows} />
      </div>

      {/* ── Year summary cards ── */}
      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(proj.years.length, 3) + ", 1fr)", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        {proj.years.map(function (yr) {
          var margin = yr.revenue > 0 ? yr.ebitda / yr.revenue : 0;
          return (
            <div key={yr.year} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif" }}>
                  {typeof t.proj_year === "function" ? t.proj_year(yr.year) : ("Année " + yr.year)}
                </h4>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: "var(--r-full)",
                  background: yr.ebitda >= 0 ? "var(--color-success-bg)" : "var(--color-error-bg)",
                  color: yr.ebitda >= 0 ? "var(--color-success)" : "var(--color-error)",
                  border: "1px solid " + (yr.ebitda >= 0 ? "var(--color-success-border)" : "var(--color-error-border)"),
                }}>
                  {yr.ebitda >= 0 ? "+" : ""}{pct(margin)}
                </span>
              </div>
              {[
                { label: t.proj_revenue || "Revenus", value: eur(yr.revenue), color: "var(--color-success)" },
                { label: t.proj_costs || "Charges", value: eur(yr.costs), color: "var(--text-primary)" },
                { label: "EBITDA", value: eur(yr.ebitda), color: yr.ebitda >= 0 ? ok : err, bold: true },
                { label: t.proj_end_cash || "Trésorerie fin", value: eur(yr.endCash), color: yr.endCash >= 0 ? "var(--text-primary)" : err },
              ].map(function (row, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-1) 0", borderBottom: i < 3 ? "1px solid var(--border-light)" : "none" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: row.bold ? 700 : 500, color: row.color, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Monthly table ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-card)", padding: "var(--sp-4)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 var(--sp-4)" }}>{t.table_title || "Détail mensuel"}</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {[t.col_month || "Mois", t.col_rev || "Revenu", t.col_costs || "Charges", t.col_net || "Cash-flow", t.col_cum || "Cumulatif"].map(function (h, i) {
                  return <th key={i} style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: i === 0 ? "left" : "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {proj.rows.map(function (row) {
                var isZero = proj.zeroMonth && row.month === proj.zeroMonth;
                var isBe = proj.beMonth && row.month === proj.beMonth;
                var isYearEnd = row.month % 12 === 0;
                return (
                  <tr key={row.month} style={{
                    borderBottom: isYearEnd ? "2px solid var(--border)" : "1px solid var(--border-light)",
                    background: isZero ? "var(--color-error-bg)" : isBe ? "var(--color-success-bg)" : "transparent",
                  }}>
                    <td style={{ padding: "var(--sp-2) var(--sp-3)", color: "var(--text-secondary)", fontWeight: isYearEnd ? 700 : 500 }}>{"M" + row.month}</td>
                    <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{eur(row.monthlyRevenue)}</td>
                    <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{eur(row.monthlyCosts)}</td>
                    <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontWeight: 600, color: row.net >= 0 ? ok : "var(--color-error)", fontVariantNumeric: "tabular-nums" }}>{eur(row.net)}</td>
                    <td style={{ padding: "var(--sp-2) var(--sp-3)", textAlign: "right", fontWeight: 700, color: row.cumulative >= 0 ? "var(--text-primary)" : "var(--color-error)", fontVariantNumeric: "tabular-nums" }}>{eur(row.cumulative)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: "var(--sp-3)", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
          {typeof t.proj_footnote === "function" ? t.proj_footnote(pct(cfg.revenueGrowthRate || 0.10), pct(cfg.costEscalation || 0.02)) : ""}
        </div>
      </div>

    </PageLayout>
  );
}
