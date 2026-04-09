function PreviewCard({ title, description, children }) {
  return (
    <div className="rounded-[24px] border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-primary)]">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function PreviewPanel({ tokens }) {
  return (
    <div
      className="rounded-[32px] border border-border p-6 shadow-panel"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--color-background) 94%, white), color-mix(in srgb, var(--color-secondary) 42%, white))",
        color: "var(--color-primary)",
        fontFamily: "var(--font-family)",
        fontSize: "var(--font-size-base)",
      }}
    >
      <div className="mb-6 flex flex-col gap-2 border-b border-black/5 pb-5">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Live Preview
        </span>
        <h2 className="text-2xl font-semibold">Style system in motion</h2>
        <p className="max-w-2xl text-sm text-slate-600">
          Buttons, form controls, cards, and typography update immediately as tokens change.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <PreviewCard
          title="Interactive Components"
          description="The preview uses CSS variables only, mirroring how a design system would theme a product."
        >
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl px-5 py-3 font-medium text-white transition-all duration-200 ease-smooth hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Primary Button
            </button>
            <button
              type="button"
              className="rounded-2xl border px-5 py-3 font-medium transition-all duration-200 ease-smooth hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor: "color-mix(in srgb, var(--color-primary) 16%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              Secondary Button
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="text"
              placeholder="team@stylesync.dev"
              className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-200 ease-smooth focus:-translate-y-0.5"
              style={{
                borderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                backgroundColor: "rgba(255,255,255,0.84)",
                color: "var(--color-primary)",
              }}
            />
          </div>
        </PreviewCard>

        <PreviewCard
          title="Token Snapshot"
          description="A quick read of the active design tokens driving the preview."
        >
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Primary</dt>
              <dd className="font-medium">{tokens.colors.primary}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Secondary</dt>
              <dd className="font-medium">{tokens.colors.secondary}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Background</dt>
              <dd className="font-medium">{tokens.colors.background}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Font</dt>
              <dd className="max-w-[200px] text-right font-medium">
                {tokens.typography.fontFamily}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Base size</dt>
              <dd className="font-medium">{tokens.typography.baseSize}</dd>
            </div>
          </dl>
        </PreviewCard>

        <PreviewCard
          title="Card Component"
          description="A flexible product surface with subtle depth and theme-aware contrast."
        >
          <div
            className="rounded-[28px] border p-5"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.88), color-mix(in srgb, var(--color-secondary) 34%, white))",
              borderColor: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
            }}
          >
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              Product Update
            </p>
            <h4 className="mt-3 text-xl font-semibold">
              Token-driven interfaces stay consistent faster.
            </h4>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
              Pull a palette from any site, refine it with a few locked decisions, and keep a
              reliable live preview visible throughout the process.
            </p>
          </div>
        </PreviewCard>

        <PreviewCard
          title="Typography Scale"
          description="Relative sizing derives from the shared base size token."
        >
          <div className="space-y-3">
            <p style={{ fontSize: "calc(var(--font-size-base) * 2.25)", lineHeight: 1.05 }}>
              Heading One
            </p>
            <p style={{ fontSize: "calc(var(--font-size-base) * 1.75)", lineHeight: 1.1 }}>
              Heading Two
            </p>
            <p style={{ fontSize: "var(--font-size-base)", lineHeight: 1.6 }}>
              Body copy adapts instantly when typography settings change, making spacing and rhythm
              easy to evaluate.
            </p>
            <p style={{ fontSize: "calc(var(--font-size-base) * 0.8)" }} className="text-slate-500">
              Caption text for helper details and supporting metadata.
            </p>
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}
