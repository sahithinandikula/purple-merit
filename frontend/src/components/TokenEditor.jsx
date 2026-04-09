import { fontOptions } from "../lib/constants";

const safeHex = (value) =>
  /^#([0-9a-f]{6})$/i.test(value) ? value : "#111111";

function LockToggle({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 w-12 items-center rounded-full border p-1 transition-all duration-200 ease-smooth ${
        active
          ? "border-slate-900 bg-slate-900"
          : "border-slate-200 bg-slate-200/70"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-smooth ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ColorField({ label, value, locked, onChange, onToggleLock }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <LockToggle active={locked} onClick={onToggleLock} />
      </div>
      <div className="flex gap-3">
        <input
          type="color"
          value={safeHex(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors duration-200 ease-smooth focus:border-slate-400"
        />
      </div>
    </div>
  );
}

function TypographyField({
  label,
  children,
  locked,
  onToggleLock,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <LockToggle active={locked} onClick={onToggleLock} />
      </div>
      {children}
    </div>
  );
}

export function TokenEditor({ tokens, locked, updateColor, updateTypography, toggleLock }) {
  const availableFonts = fontOptions.includes(tokens.typography.fontFamily)
    ? fontOptions
    : [tokens.typography.fontFamily, ...fontOptions];

  return (
    <div className="space-y-4">
      <Section
        title="Color Tokens"
        description="Adjust extracted colors, or lock values to preserve them on the next scrape."
      >
        <ColorField
          label="Primary"
          value={tokens.colors.primary}
          locked={locked.primary}
          onChange={(value) => updateColor("primary", value)}
          onToggleLock={() => toggleLock("primary")}
        />
        <ColorField
          label="Secondary"
          value={tokens.colors.secondary}
          locked={locked.secondary}
          onChange={(value) => updateColor("secondary", value)}
          onToggleLock={() => toggleLock("secondary")}
        />
        <ColorField
          label="Background"
          value={tokens.colors.background}
          locked={locked.background}
          onChange={(value) => updateColor("background", value)}
          onToggleLock={() => toggleLock("background")}
        />
      </Section>

      <Section
        title="Typography Tokens"
        description="Preview text updates instantly through CSS custom properties."
      >
        <TypographyField
          label="Font Family"
          locked={locked.fontFamily}
          onToggleLock={() => toggleLock("fontFamily")}
        >
          <select
            value={tokens.typography.fontFamily}
            onChange={(event) => updateTypography("fontFamily", event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors duration-200 ease-smooth focus:border-slate-400"
          >
            {availableFonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </TypographyField>

        <TypographyField
          label="Base Font Size"
          locked={locked.baseSize}
          onToggleLock={() => toggleLock("baseSize")}
        >
          <input
            type="text"
            value={tokens.typography.baseSize}
            onChange={(event) => updateTypography("baseSize", event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors duration-200 ease-smooth focus:border-slate-400"
          />
        </TypographyField>
      </Section>
    </div>
  );
}
