/**
 * ModalSideNav — Reusable left-panel navigation for split-panel modals.
 *
 * Used in ShareholderModal (CapTable), SalaryModal, ProgramModal (Affiliation).
 *
 * Props:
 *   title    — Section header text
 *   items    — Array of { key, icon, label }
 *   selected — Currently selected key
 *   onSelect — function(key)
 *   width    — Optional panel width (default 200)
 */
import useBreakpoint from "../hooks/useBreakpoint";

export default function ModalSideNav({ title, items, selected, onSelect, width, mobileLayout }) {
  var w = width || 200;
  var bp = useBreakpoint();
  var isMobile = bp.isMobile;
  var useMobileTop = isMobile && (mobileLayout || "sidebar") === "top";

  return (
    <div style={{
      width: useMobileTop ? "100%" : w,
      flexShrink: 0,
      borderRight: useMobileTop ? "none" : "1px solid var(--border)",
      borderBottom: useMobileTop ? "1px solid var(--border)" : undefined,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    }}>
      <div style={{ padding: useMobileTop ? "var(--sp-4) var(--sp-4) var(--sp-2)" : "var(--sp-4) var(--sp-3)", borderBottom: useMobileTop ? "none" : "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif" }}>
          {title}
        </div>
      </div>
      <div className="custom-scroll" style={{
        flex: 1,
        display: "flex",
        flexDirection: useMobileTop ? "row" : "column",
        overflowX: useMobileTop ? "auto" : "hidden",
        overflowY: useMobileTop ? "hidden" : "auto",
        padding: useMobileTop ? "0 var(--sp-4) var(--sp-3)" : "var(--sp-2)",
        gap: useMobileTop ? "var(--sp-2)" : 0,
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border-strong) transparent",
      }}>
        {items.map(function (item) {
          var CIcon = item.icon;
          var isActive = selected === item.key;
          return (
            <button key={item.key} type="button" onClick={function () { onSelect(item.key); }}
              style={{
                display: "flex", alignItems: "center", gap: "var(--sp-2)",
                width: useMobileTop ? "auto" : "100%",
                minWidth: useMobileTop ? "max-content" : undefined,
                padding: "10px var(--sp-3)",
                border: "none", borderRadius: "var(--r-md)",
                background: isActive ? "var(--brand-bg)" : "transparent",
                cursor: "pointer", textAlign: "left", marginBottom: useMobileTop ? 0 : 2,
                transition: "background 0.1s", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={function (e) { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = isActive ? "var(--brand-bg)" : "transparent"; }}
            >
              {CIcon ? <CIcon size={16} weight={isActive ? "fill" : "regular"} color={isActive ? "var(--brand)" : "var(--text-muted)"} style={{ flexShrink: 0 }} /> : null}
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--brand)" : "var(--text-secondary)", flex: useMobileTop ? "none" : 1 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
