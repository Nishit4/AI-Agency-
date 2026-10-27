const BAR_AREA_HEIGHT = 128; // px

/** Tiny dependency-free bar chart for dashboards. */
export function BarChart({
  data,
  format = (value) => String(value),
}: {
  data: { label: string; amount: number }[];
  format?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 sm:gap-3" role="img" aria-label="Bar chart">
      {data.map((d, index) => (
        <div key={`${d.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="h-4 text-[10px] font-medium text-stone-500 sm:text-xs">
            {d.amount > 0 ? format(d.amount) : ""}
          </span>
          <div className="flex w-full items-end" style={{ height: BAR_AREA_HEIGHT }}>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400"
              style={{
                height: Math.max(4, Math.round((d.amount / max) * BAR_AREA_HEIGHT)),
                opacity: d.amount ? 1 : 0.25,
              }}
            />
          </div>
          <span className="text-[10px] text-stone-500 sm:text-xs">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
