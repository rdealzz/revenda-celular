import type { TooltipContentProps } from 'recharts'
import { useChartTheme } from './chartTheme'

export type Formatter = (value: number) => string

export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: Partial<TooltipContentProps<number, string>> & { format?: Formatter }) {
  const theme = useChartTheme()
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-2xl border border-[rgb(var(--hairline))] px-3.5 py-2.5 shadow-lift backdrop-blur-xl"
      style={{ background: theme.tooltipSurface }}
    >
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-3">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2 text-[13px]">
            <span className="size-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-2">{entry.name}</span>
            <span className="tabular ml-auto font-medium text-1">
              {format ? format(Number(entry.value ?? 0)) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
