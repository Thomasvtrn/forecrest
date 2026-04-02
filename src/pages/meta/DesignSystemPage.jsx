import { useEffect, useState } from "react";
import { Check, Copy, Plus, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { Accordion, Badge, Button, ButtonGroup, Card, NumberField, PageLayout, SearchInput, SelectDropdown } from "../../components";

var CATEGORY_GROUPS = [
  {
    title: "Actions",
    subtitle: "Primary actions, hierarchy, grouped controls.",
    items: [
      "Button: hierarchy, size, state, enhancers",
      "ButtonGroup: basic, radio, checkbox, disabled",
    ],
  },
  {
    title: "Input and Selection",
    subtitle: "Search, dropdowns, numeric input and inline states.",
    items: [
      "SearchInput: empty and filled",
      "SelectDropdown: placeholder, active value",
      "NumberField: compact, invalid, percent",
    ],
  },
  {
    title: "Feedback and Surface",
    subtitle: "Status, grouping, visual rhythm, section wrappers.",
    items: [
      "Badge: semantic and tier variants",
      "Card: default surface shell",
      "Accordion: collapsible information blocks",
    ],
  },
  {
    title: "Token Bridge",
    subtitle: "Forecrest foundations mapped to Untitled semantics.",
    items: [
      "Brand and neutral scales",
      "Text, border, ring and background aliases",
      "Light and dark mode utility remaps",
    ],
  },
];

var FOUNDATION_GROUPS = [
  {
    label: "Forecrest Brand",
    tokens: ["--brand", "--brand-hover", "--brand-bg", "--brand-border", "--brand-gradient-end", "--color-on-brand"],
  },
  {
    label: "Forecrest Surfaces",
    tokens: ["--bg-page", "--bg-card", "--bg-hover", "--bg-accordion", "--input-bg", "--overlay-bg"],
  },
  {
    label: "Forecrest Type",
    tokens: ["--text-primary", "--text-secondary", "--text-tertiary", "--text-muted", "--text-faint", "--text-ghost"],
  },
  {
    label: "Forecrest Semantic",
    tokens: [
      "--color-success",
      "--color-success-bg",
      "--color-warning",
      "--color-warning-bg",
      "--color-error",
      "--color-error-bg",
      "--color-info",
      "--color-info-bg",
    ],
  },
];

var UNTITLED_GROUPS = [
  {
    label: "Untitled Brand Scale",
    tokens: [
      "--color-brand-50",
      "--color-brand-100",
      "--color-brand-200",
      "--color-brand-300",
      "--color-brand-400",
      "--color-brand-500",
      "--color-brand-600",
      "--color-brand-700",
    ],
  },
  {
    label: "Untitled Neutral Scale",
    tokens: [
      "--color-neutral-50",
      "--color-neutral-100",
      "--color-neutral-200",
      "--color-neutral-300",
      "--color-neutral-400",
      "--color-neutral-500",
      "--color-neutral-600",
      "--color-neutral-700",
    ],
  },
  {
    label: "Untitled Semantic Tokens",
    tokens: [
      "--color-text-primary",
      "--color-text-secondary",
      "--color-border-primary",
      "--color-border-brand",
      "--color-bg-primary",
      "--color-bg-secondary",
      "--color-bg-brand-solid",
      "--color-bg-overlay",
    ],
  },
  {
    label: "Untitled Property Aliases",
    tokens: [
      "--text-color-primary",
      "--background-color-primary",
      "--background-color-brand-solid",
      "--border-color-primary",
      "--border-color-brand",
      "--ring-color-brand",
      "--outline-color-brand",
      "--color-utility-neutral-500",
    ],
  },
];

var TOKEN_MAPPINGS = [
  { forecrest: "--brand", untitled: "--color-brand-500", reason: "Primary accent and emphasis actions." },
  { forecrest: "--bg-card", untitled: "--color-bg-primary", reason: "Default elevated surface." },
  { forecrest: "--bg-page", untitled: "--color-bg-secondary_alt", reason: "Canvas / application backdrop." },
  { forecrest: "--text-primary", untitled: "--color-text-primary", reason: "Default readable text." },
  { forecrest: "--text-muted", untitled: "--color-text-tertiary", reason: "Supporting copy and descriptions." },
  { forecrest: "--border", untitled: "--color-border-primary", reason: "Standard outlines and separators." },
  { forecrest: "--color-error", untitled: "--color-text-error-primary", reason: "Destructive states and validation." },
  { forecrest: "--focus-ring", untitled: "--ring-color-brand", reason: "Accessible focus treatment." },
];

function resolveVar(token) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  } catch (error) {
    return "";
  }
}

function isColor(value) {
  return value && (value.indexOf("#") === 0 || value.indexOf("rgb") === 0 || value.indexOf("hsl") === 0 || value.indexOf("var(") === 0);
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div style={{ marginBottom: "var(--sp-4)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif", marginBottom: "var(--sp-2)" }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 760 }}>
        {copy}
      </div>
    </div>
  );
}

function CategoryCard({ title, subtitle, items }) {
  return (
    <Card sx={{ height: "100%" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Bricolage Grotesque', 'DM Sans', sans-serif", marginBottom: "var(--sp-2)" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "var(--sp-4)", minHeight: 40 }}>
        {subtitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
        {items.map(function (item) {
          return (
            <div key={item} style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", fontSize: 13, color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--brand)", lineHeight: 1 }}>*</span>
              <span>{item}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DemoCard({ title, note, children }) {
  return (
    <Card sx={{ height: "100%" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--sp-2)" }}>
        {title}
      </div>
      {note ? (
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: "var(--sp-4)" }}>
          {note}
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-3)", alignItems: "center" }}>
        {children}
      </div>
    </Card>
  );
}

function ColorSwatch({ value }) {
  if (!isColor(value)) return <div style={{ width: 28, height: 28 }} />;
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: value, border: "1px solid var(--border)", flexShrink: 0 }} />
  );
}

function TokenRow({ token, value }) {
  var [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("var(" + token + ")");
    setCopied(true);
    window.setTimeout(function () { setCopied(false); }, 1200);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "28px minmax(0, 1fr) auto",
        gap: "var(--sp-3)",
        alignItems: "center",
        padding: "var(--sp-3)",
        border: "none",
        borderBottom: "1px solid var(--border-light)",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <ColorSwatch value={value} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
          {token}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || "-"}
        </div>
      </div>
      <div style={{ fontSize: 11, color: copied ? "var(--brand)" : "var(--text-ghost)", whiteSpace: "nowrap" }}>
        {copied ? "Copied" : "Copy"}
      </div>
    </button>
  );
}

function TokenGroup({ label, tokens, resolved }) {
  return (
    <Card sx={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "var(--sp-4) var(--sp-4) var(--sp-3)", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
      </div>
      {tokens.map(function (token, index) {
        return (
          <div key={token} style={{ borderBottom: index === tokens.length - 1 ? "none" : undefined }}>
            <TokenRow token={token} value={resolved[token]} />
          </div>
        );
      })}
    </Card>
  );
}

export default function DesignSystemPage() {
  var [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
  var [resolved, setResolved] = useState({});
  var [searchValue, setSearchValue] = useState("");
  var [filledSearchValue, setFilledSearchValue] = useState("runway");
  var [segmentSize, setSegmentSize] = useState("md");
  var [radioValue, setRadioValue] = useState("monthly");
  var [checkboxValue, setCheckboxValue] = useState(["growth", "cash"]);
  var [planValue, setPlanValue] = useState("starter");
  var [numberValue, setNumberValue] = useState(12);
  var [ratioValue, setRatioValue] = useState(0.18);

  useEffect(function () {
    var next = {};
    FOUNDATION_GROUPS.concat(UNTITLED_GROUPS).forEach(function (group) {
      group.tokens.forEach(function (token) {
        next[token] = resolveVar(token);
      });
    });
    setResolved(next);
  }, [theme]);

  useEffect(function () {
    var observer = new MutationObserver(function () {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return function () { observer.disconnect(); };
  }, []);

  return (
    <PageLayout
      title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>Design System <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-dev)", background: "var(--color-dev-bg)", border: "1px solid var(--color-dev-border)", padding: "2px 8px", borderRadius: "var(--r-full)", letterSpacing: "0.06em", textTransform: "uppercase" }}>DEV</span></span>}
      subtitle={"Forecrest component catalogue and Untitled UI token bridge (" + theme + " mode)"}
    >
      <SectionHeader
        eyebrow="Base style structure"
        title="Variants first, tokens second"
        copy="This page follows the same documentation rhythm as Base: when to use, visible variants, state coverage, then theming hooks. We keep Forecrest's warm visual language, but map it into Untitled UI semantic tokens so future components can share one system."
      />

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-xl)" }}>
        {CATEGORY_GROUPS.map(function (group) {
          return <CategoryCard key={group.title} title={group.title} subtitle={group.subtitle} items={group.items} />;
        })}
      </div>

      <SectionHeader
        eyebrow="Actions"
        title="Buttons and grouped actions"
        copy="Use a primary button for the dominant action, secondary and tertiary buttons for hierarchy, and button groups when a set of related choices needs to stay visually connected."
      />

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <DemoCard title="Button hierarchy" note="Inspired by Base's kind variants and action hierarchy.">
          <Button color="primary" size="lg">Primary</Button>
          <Button color="secondary" size="lg">Secondary</Button>
          <Button color="tertiary" size="lg">Tertiary</Button>
          <Button color="primary-destructive" size="lg">Destructive</Button>
          <Button color="link-color" size="lg">Link color</Button>
        </DemoCard>
        <DemoCard title="Button sizes and states" note="Size, loading, disabled, and enhancer coverage.">
          <Button color="primary" size="sm">Small</Button>
          <Button color="primary" size="md">Medium</Button>
          <Button color="primary" size="lg">Large</Button>
          <Button color="primary" size="xl" iconTrailing={<ArrowRight size={16} weight="bold" />}>XL with icon</Button>
          <Button color="secondary" size="md" isLoading>Loading</Button>
          <Button color="tertiary" size="md" isDisabled>Disabled</Button>
        </DemoCard>
      </div>

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-xl)" }}>
        <DemoCard title="Button group sizes" note="Connected actions stay grouped while size follows the surrounding density.">
          <ButtonGroup
            size="sm"
            value={segmentSize}
            onChange={setSegmentSize}
            mode="radio"
            items={[{ id: "sm", label: "Small" }, { id: "md", label: "Medium" }, { id: "lg", label: "Large" }]}
          />
          <ButtonGroup
            size="md"
            value={segmentSize}
            onChange={setSegmentSize}
            mode="radio"
            items={[{ id: "sm", label: "Small" }, { id: "md", label: "Medium" }, { id: "lg", label: "Large" }]}
          />
          <ButtonGroup
            size="lg"
            value={segmentSize}
            onChange={setSegmentSize}
            mode="radio"
            items={[{ id: "sm", label: "Small" }, { id: "md", label: "Medium" }, { id: "lg", label: "Large" }]}
          />
        </DemoCard>
        <DemoCard title="Button group modes" note="Base-style basic, single select, multi select, and disabled coverage.">
          <ButtonGroup
            mode="default"
            items={[{ id: "add", label: "Add", icon: <Plus size={12} weight="bold" /> }, { id: "clone", label: "Duplicate" }, { id: "archive", label: "Archive" }]}
          />
          <ButtonGroup
            mode="radio"
            value={radioValue}
            onChange={setRadioValue}
            items={[{ id: "monthly", label: "Monthly" }, { id: "quarterly", label: "Quarterly" }, { id: "yearly", label: "Yearly" }]}
          />
          <ButtonGroup
            mode="checkbox"
            value={checkboxValue}
            onChange={setCheckboxValue}
            items={[{ id: "growth", label: "Growth" }, { id: "cash", label: "Cash" }, { id: "risk", label: "Risk" }]}
          />
          <ButtonGroup
            mode="radio"
            value="profit"
            items={[{ id: "profit", label: "Profit" }, { id: "ops", label: "Ops", disabled: true }, { id: "finance", label: "Finance" }]}
          />
        </DemoCard>
      </div>

      <SectionHeader
        eyebrow="Input and selection"
        title="Compact controls with clear states"
        copy="These variants focus on the most common enterprise scenarios in Forecrest: search, dropdown selection, and numeric adjustment. The goal is consistency more than novelty."
      />

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-xl)" }}>
        <DemoCard title="SearchInput" note="Empty and filled state.">
          <SearchInput value={searchValue} onChange={setSearchValue} placeholder="Search metrics..." width="100%" />
          <SearchInput value={filledSearchValue} onChange={setFilledSearchValue} placeholder="Search metrics..." width="100%" />
        </DemoCard>
        <DemoCard title="SelectDropdown" note="Placeholder and selected value.">
          <SelectDropdown
            value={planValue}
            onChange={setPlanValue}
            width="100%"
            options={[
              { value: "starter", label: "Starter" },
              { value: "scale", label: "Scale" },
              { value: "enterprise", label: "Enterprise" },
            ]}
            placeholder="Select a plan"
          />
        </DemoCard>
        <DemoCard title="NumberField" note="Default, invalid and percent entry.">
          <NumberField value={numberValue} onChange={setNumberValue} width="100%" />
          <NumberField value={numberValue} onChange={setNumberValue} width="100%" isInvalid hint="Value exceeds current recommendation." />
          <NumberField value={ratioValue} onChange={setRatioValue} width="100%" pct />
        </DemoCard>
      </div>

      <SectionHeader
        eyebrow="Feedback and surface"
        title="Readable status and soft container hierarchy"
        copy="Forecrest leans on warm neutrals, light semantic fills, and moderate borders. These examples show how the system behaves before we roll it out across every module."
      />

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <DemoCard title="Badge variants" note="Semantic badges used in tables, KPI cards and workflows.">
          <Badge color="brand" size="sm">Brand</Badge>
          <Badge color="success" size="sm" dot>Success</Badge>
          <Badge color="warning" size="sm" dot>Warning</Badge>
          <Badge color="error" size="sm" dot>Error</Badge>
          <Badge color="info" size="sm">Info</Badge>
          <Badge t="S" size="sm">Tier S</Badge>
        </DemoCard>
        <DemoCard title="Surface guidance" note="Cards and accordions should preserve one visual density.">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", width: "100%" }}>
            <div style={{ padding: "var(--sp-4)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--bg-page)", width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Card shell</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Use for grouped information, not for every single row.</div>
            </div>
            <div style={{ width: "100%" }}>
              <Accordion title="Accordion anatomy" sub="Trigger, supporting text, content region" open>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Forecrest accordions stay low contrast, with most emphasis coming from spacing and typography rather than heavy fills.
                </div>
              </Accordion>
            </div>
          </div>
        </DemoCard>
      </div>

      <Card sx={{ marginBottom: "var(--gap-xl)", background: "var(--bg-accordion)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)" }}>
          <WarningCircle size={18} color="var(--brand)" weight="fill" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Design rule for upcoming migrations
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
              New Untitled-inspired components should consume semantic tokens first (`--color-bg-*`, `--color-text-*`, `--color-border-*`) and only fall back to raw Forecrest tokens for one-off art direction.
            </div>
          </div>
        </div>
      </Card>

      <SectionHeader
        eyebrow="Token bridge"
        title="Forecrest colors remapped into Untitled UI semantics"
        copy="The goal is not to replace Forecrest. The goal is to expose Forecrest foundations through Untitled UI's token naming so component imports remain consistent while the product keeps its existing visual identity."
      />

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        <Card sx={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--sp-3)" }}>
            Mapping rules
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {TOKEN_MAPPINGS.map(function (entry) {
              return (
                <div key={entry.forecrest + entry.untitled} style={{ paddingBottom: "var(--sp-3)", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: 4, flexWrap: "wrap" }}>
                    <code style={{ fontSize: 12, color: "var(--text-primary)" }}>{entry.forecrest}</code>
                    <ArrowRight size={12} color="var(--text-faint)" />
                    <code style={{ fontSize: 12, color: "var(--brand)" }}>{entry.untitled}</code>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{entry.reason}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, var(--brand-bg) 0%, var(--bg-card) 55%)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--sp-3)" }}>
            Theme sync status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <Check size={14} weight="bold" color="var(--color-success)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Brand scale updated to Forecrest coral.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <Check size={14} weight="bold" color="var(--color-success)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Neutral utility scale warmed to match current surfaces.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <Check size={14} weight="bold" color="var(--color-success)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Text, border, background and ring tokens now resolve from Forecrest foundations.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
              <Copy size={14} color="var(--brand)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Token rows below remain clickable for direct CSS copy.</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)", marginBottom: "var(--gap-lg)" }}>
        {FOUNDATION_GROUPS.map(function (group) {
          return <TokenGroup key={group.label} label={group.label} tokens={group.tokens} resolved={resolved} />;
        })}
      </div>

      <div className="resp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--gap-md)" }}>
        {UNTITLED_GROUPS.map(function (group) {
          return <TokenGroup key={group.label} label={group.label} tokens={group.tokens} resolved={resolved} />;
        })}
      </div>
    </PageLayout>
  );
}
