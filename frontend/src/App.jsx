import { useEffect, useRef } from "react";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { PreviewPanel } from "./components/PreviewPanel";
import { TokenEditor } from "./components/TokenEditor";
import { UrlBar } from "./components/UrlBar";
import { saveTokens, scrapeTokens } from "./lib/api";
import { useStyleSyncStore } from "./lib/store";

function App() {
  const {
    url,
    tokens,
    locked,
    status,
    error,
    analyzedUrl,
    savedTokenId,
    setUrl,
    setStatus,
    setError,
    applyFetchedTokens,
    updateColor,
    updateTypography,
    toggleLock,
    setSavedTokenId,
    resetError,
  } = useStyleSyncStore();
  const debounceRef = useRef();

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", tokens.colors.primary);
    document.documentElement.style.setProperty("--color-secondary", tokens.colors.secondary);
    document.documentElement.style.setProperty("--color-background", tokens.colors.background);
    document.documentElement.style.setProperty("--font-family", tokens.typography.fontFamily);
    document.documentElement.style.setProperty("--font-size-base", tokens.typography.baseSize);
  }, [tokens]);

  const runAnalysis = ({ refine = false } = {}) => {
    if (!url.trim()) {
      setError("Enter a valid website URL.");
      setStatus("error");
      return;
    }

    resetError();
    setStatus("loading");
    window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const nextTokens = await scrapeTokens(url, {
          refine,
          currentTokens: tokens,
        });
        applyFetchedTokens(nextTokens);
      } catch (requestError) {
        setError(requestError.message);
        setStatus("error");
      }
    }, 350);
  };

  const handleAnalyze = () => {
    runAnalysis();
  };

  const handleRefine = () => {
    runAnalysis({ refine: true });
  };

  const handleSave = async () => {
    try {
      const record = await saveTokens({ url: analyzedUrl || url, tokens, locked });
      setSavedTokenId(record.id);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-app bg-grain px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 backdrop-blur">
            StyleSync
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Extract, refine, and preview design tokens from any website.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Pull foundational colors and typography with a single URL, lock the decisions you
                want to preserve, and inspect a polished component preview that updates instantly.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-slate-900">Current session</p>
              <p className="mt-1 text-sm text-slate-500">
                {analyzedUrl ? `Analyzed: ${analyzedUrl}` : "No site analyzed yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {savedTokenId ? `Saved token set: ${savedTokenId}` : "Supabase save optional"}
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: tokens.colors.primary }}
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Detected Brand Color
                  </p>
                  <p className="text-sm font-medium text-slate-900">{tokens.colors.primary}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <UrlBar
          url={url}
          onUrlChange={setUrl}
          onAnalyze={handleAnalyze}
          onRefine={handleRefine}
          onSave={handleSave}
          isLoading={isLoading}
          canSave={Boolean((analyzedUrl || url) && !isLoading)}
        />

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <main className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[0.32fr_0.68fr]">
              <TokenEditor
                tokens={tokens}
                locked={locked}
                updateColor={updateColor}
                updateTypography={updateTypography}
                toggleLock={toggleLock}
              />
              <PreviewPanel tokens={tokens} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
