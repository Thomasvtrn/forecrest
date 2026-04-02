import { SearchLg, XClose } from "@untitledui/icons";

export default function SearchField({ value, onChange, placeholder, width, height }) {
  var w = width || 200;
  var h = height || 40;
  var hasValue = value.length > 0;

  return (
    <div style={{ position: "relative", display: w === "100%" ? "flex" : "inline-flex", alignItems: "center", width: w === "100%" ? "100%" : undefined }}>
      <SearchLg style={{
        position: "absolute", left: 12, pointerEvents: "none",
        width: 16, height: 16, color: "var(--text-muted)",
      }} />
      <input
        type="text"
        value={value}
        onChange={function (e) { onChange(e.target.value); }}
        placeholder={placeholder || ""}
        style={{
          height: h, width: w,
          paddingLeft: 34, paddingRight: hasValue ? 32 : "var(--sp-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          fontSize: 13, fontFamily: "inherit",
          outline: "none",
          transition: "border-color 0.12s",
        }}
        onFocus={function (e) { e.currentTarget.style.borderColor = "var(--brand)"; }}
        onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={function () { onChange(""); }}
          aria-label="Clear"
          style={{
            position: "absolute", right: 8,
            width: 20, height: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", borderRadius: "var(--r-full)",
            background: "var(--bg-hover)",
            color: "var(--text-muted)",
            cursor: "pointer", padding: 0,
            lineHeight: 1,
          }}
        >
          <XClose style={{ width: 14, height: 14 }} />
        </button>
      ) : null}
    </div>
  );
}
