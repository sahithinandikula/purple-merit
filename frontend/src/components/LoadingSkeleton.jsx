export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.3fr_0.7fr]">
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-[24px] border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-[560px] animate-pulse rounded-[32px] border border-slate-200 bg-white" />
    </div>
  );
}
