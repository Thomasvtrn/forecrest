import { Lifebuoy, MagnifyingGlass, ShareNetwork } from "@phosphor-icons/react";
import { useGlossary, useLang, useT } from "../context";
import useBreakpoint from "../hooks/useBreakpoint";
import CollabBar from "./CollabBar";
import ButtonUtility from "./ButtonUtility";

var MARKETING_TABS = ["marketing", "mkt_campaigns", "mkt_channels", "mkt_budget", "mkt_conversions"];
var TOOLS_TABS = ["tool_qr", "tool_domain", "tool_trademark", "tool_employee", "tool_freelance", "tool_costing", "tool_currency", "tool_vat"];
var META_TABS = ["profile", "set", "changelog", "credits", "admin", "design-system", "dev-tooltips", "dev-calc", "dev-roadmap", "dev-sitemap", "dev-perf"];
var MODULES = [
  { id: "core", label: { fr: "Finance", en: "Finance" }, tab: "overview" },
  { id: "marketing", label: { fr: "Marketing", en: "Marketing" }, tab: "marketing" },
  { id: "tools_mod", label: { fr: "Outils", en: "Tools" }, tab: "tool_qr" },
];

function isModuleActive(moduleId, tab, activeModule) {
  if (moduleId === "marketing") return MARKETING_TABS.indexOf(tab) >= 0 || activeModule === "marketing";
  if (moduleId === "tools_mod") return TOOLS_TABS.indexOf(tab) >= 0 || activeModule === "tools_mod";
  if (META_TABS.indexOf(tab) >= 0) return false;
  return MARKETING_TABS.indexOf(tab) < 0 && TOOLS_TABS.indexOf(tab) < 0;
}

function ModuleNavButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 36,
        padding: active ? "0 16px" : "0 14px",
        borderRadius: "var(--r-full)",
        border: "1px solid " + (active ? "var(--brand-border)" : "transparent"),
        background: active ? "var(--brand-bg)" : "transparent",
        color: active ? "var(--brand)" : "var(--text-secondary)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: active ? 700 : 600,
        letterSpacing: "-0.01em",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function AppHeader({ tab, setTab, activeModule, onOpenSearch, onOpenShare, onViewAll }) {
  var { lang } = useLang();
  var t = useT();
  var glossary = useGlossary();
  var bp = useBreakpoint();
  var lk = lang === "en" ? "en" : "fr";

  if (bp.isMobile) return null;

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 30, marginBottom: "var(--gap-lg)" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--sp-4)",
        padding: "12px 16px",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--border)",
        background: "var(--bg-card-translucent)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: "blur(16px)",
      }}>
        <nav aria-label={lk === "fr" ? "Navigation principale" : "Primary navigation"} style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-1)",
          flexWrap: "wrap",
          minWidth: 0,
        }}>
          {MODULES.map(function (module) {
            return (
              <ModuleNavButton
                key={module.id}
                active={isModuleActive(module.id, tab, activeModule)}
                label={module.label[lk]}
                onClick={function () { setTab(module.tab); }}
              />
            );
          })}
        </nav>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-2)",
          marginLeft: "auto",
          flexShrink: 0,
        }}>
          <ButtonUtility
            icon={<MagnifyingGlass size={16} />}
            variant="default"
            size="header"
            onClick={onOpenSearch}
            title={lk === "fr" ? "Recherche" : "Search"}
          />
          <CollabBar
            embedded={true}
            onViewAll={onViewAll}
            currentTab={tab}
            tabLabels={t.tabs}
            showShare={false}
            showSupport={false}
          />
          <ButtonUtility
            icon={<ShareNetwork size={16} />}
            variant="default"
            size="header"
            onClick={onOpenShare}
            title={lk === "fr" ? "Partager" : "Share"}
          />
          <ButtonUtility
            icon={<Lifebuoy size={16} />}
            variant="default"
            size="header"
            onClick={function () { glossary.open(null); }}
            title={lk === "fr" ? "Aide" : "Help"}
          />
        </div>
      </div>
    </div>
  );
}
