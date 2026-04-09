export function UrlBar({
  url,
  onUrlChange,
  onAnalyze,
  onRefine,
  onSave,
  isLoading,
  canSave,
}) {
  return (
    <div className="rounded-[28px] border border-border bg-white/80 p-4 shadow-panel backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label
            htmlFor="website-url"
            className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-muted"
          >
            Website URL
          </label>
          <input
            id="website-url"
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-ink outline-none transition-all duration-200 ease-smooth placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex gap-3 pt-0 lg:self-end">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading}
            className="h-12 rounded-2xl bg-slate-950 px-6 text-sm font-medium text-white transition-all duration-200 ease-smooth hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
          >
            Analyze
          </button>
          <button
            type="button"
            onClick={onRefine}
            disabled={isLoading}
            className="h-12 rounded-2xl border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-all duration-200 ease-smooth hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:text-slate-300"
          >
            Refine Colors
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="h-12 rounded-2xl border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-all duration-200 ease-smooth hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Save Tokens
          </button>
        </div>
      </div>
    </div>
  );
}
