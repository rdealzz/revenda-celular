import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { useChartTheme } from './chartTheme'
import { formatCurrencyCompact, formatDays, formatNumber } from '../../lib/format'
import type { BrandStat, MonthPoint } from '../../lib/metrics'

const AXIS = { tickLine: false, axisLine: false, fontSize: 11 } as const
const ANIMATION = { animationDuration: 700, animationEasing: 'ease-out' } as const

function Frame({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function ProfitTrendChart({ data }: { data: MonthPoint[] }) {
  const theme = useChartTheme()
  return (
    <Frame>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-profit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.positive} stopOpacity={0.34} />
            <stop offset="100%" stopColor={theme.positive} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" stroke={theme.axis} {...AXIS} />
        <YAxis stroke={theme.axis} width={62} tickFormatter={formatCurrencyCompact} {...AXIS} />
        <Tooltip cursor={{ stroke: theme.grid }} content={<ChartTooltip format={formatCurrencyCompact} />} />
        <Area
          type="monotone"
          dataKey="cumulativeProfit"
          name="Lucro acumulado"
          stroke={theme.positive}
          strokeWidth={2.4}
          fill="url(#grad-profit)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
          {...ANIMATION}
        />
      </AreaChart>
    </Frame>
  )
}

export function MonthlyProfitChart({ data }: { data: MonthPoint[] }) {
  const theme = useChartTheme()
  return (
    <Frame>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" stroke={theme.axis} {...AXIS} />
        <YAxis stroke={theme.axis} width={62} tickFormatter={formatCurrencyCompact} {...AXIS} />
        <Tooltip cursor={{ fill: theme.grid }} content={<ChartTooltip format={formatCurrencyCompact} />} />
        <Bar dataKey="profit" name="Lucro líquido" radius={[7, 7, 7, 7]} maxBarSize={30} {...ANIMATION}>
          {data.map((point) => (
            <Cell key={point.key} fill={point.profit >= 0 ? theme.positive : theme.negative} />
          ))}
        </Bar>
      </BarChart>
    </Frame>
  )
}

export function FlowChart({ data }: { data: MonthPoint[] }) {
  const theme = useChartTheme()
  return (
    <Frame>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" stroke={theme.axis} {...AXIS} />
        <YAxis stroke={theme.axis} width={32} allowDecimals={false} {...AXIS} />
        <Tooltip cursor={{ fill: theme.grid }} content={<ChartTooltip format={formatNumber} />} />
        <Bar dataKey="purchases" name="Compras" fill={theme.accent} radius={[7, 7, 7, 7]} maxBarSize={16} {...ANIMATION} />
        <Bar dataKey="sales" name="Vendas" fill={theme.violet} radius={[7, 7, 7, 7]} maxBarSize={16} {...ANIMATION} />
      </BarChart>
    </Frame>
  )
}

export function InvestedVsReturnChart({ data }: { data: MonthPoint[] }) {
  const theme = useChartTheme()
  return (
    <Frame>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-invested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.accent} stopOpacity={0.3} />
            <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-return" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.violet} stopOpacity={0.3} />
            <stop offset="100%" stopColor={theme.violet} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" stroke={theme.axis} {...AXIS} />
        <YAxis stroke={theme.axis} width={62} tickFormatter={formatCurrencyCompact} {...AXIS} />
        <Tooltip cursor={{ stroke: theme.grid }} content={<ChartTooltip format={formatCurrencyCompact} />} />
        <Area
          type="monotone"
          dataKey="purchaseValue"
          name="Investido"
          stroke={theme.accent}
          strokeWidth={2.2}
          fill="url(#grad-invested)"
          dot={false}
          {...ANIMATION}
        />
        <Area
          type="monotone"
          dataKey="salesValue"
          name="Retorno"
          stroke={theme.violet}
          strokeWidth={2.2}
          fill="url(#grad-return)"
          dot={false}
          {...ANIMATION}
        />
      </AreaChart>
    </Frame>
  )
}

export function SellingTimeChart({ data }: { data: MonthPoint[] }) {
  const theme = useChartTheme()
  return (
    <Frame>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" stroke={theme.axis} {...AXIS} />
        <YAxis stroke={theme.axis} width={36} {...AXIS} />
        <Tooltip cursor={{ stroke: theme.grid }} content={<ChartTooltip format={(value) => formatDays(value)} />} />
        <Line
          type="monotone"
          dataKey="averageDaysToSell"
          name="Dias até vender"
          stroke={theme.caution}
          strokeWidth={2.4}
          dot={{ r: 3, strokeWidth: 0, fill: theme.caution }}
          activeDot={{ r: 5 }}
          connectNulls
          {...ANIMATION}
        />
      </LineChart>
    </Frame>
  )
}

export function BrandDonutChart({ data }: { data: BrandStat[] }) {
  const theme = useChartTheme()
  const slices = data.slice(0, 7)

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 sm:flex-row">
      <div className="h-[210px] w-full shrink-0 sm:w-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip format={formatNumber} />} />
            <Pie
              data={slices}
              dataKey="count"
              nameKey="brand"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={3}
              stroke="none"
              {...ANIMATION}
            >
              {slices.map((slice, index) => (
                <Cell key={slice.brand} fill={theme.palette[index % theme.palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-2.5">
        {slices.map((slice, index) => (
          <li key={slice.brand} className="flex items-center gap-2.5 text-[13px]">
            <span
              className="size-2.5 rounded-full"
              style={{ background: theme.palette[index % theme.palette.length] }}
            />
            <span className="text-1">{slice.brand}</span>
            <span className="tabular ml-auto text-2">{slice.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
