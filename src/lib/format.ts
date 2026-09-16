const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
})

const currencyCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const longDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

export const formatCurrency = (value: number): string => currency.format(value || 0)

export const formatCurrencyCompact = (value: number): string =>
  Math.abs(value) >= 10_000 ? currencyCompact.format(value || 0) : currency.format(value || 0)

export const formatNumber = (value: number): string => decimal.format(value || 0)

export const formatPercent = (value: number): string =>
  `${decimal.format(value || 0)}%`

export const formatSignedCurrency = (value: number): string =>
  `${value > 0 ? '+' : ''}${currency.format(value || 0)}`

/** Datas são guardadas como `yyyy-mm-dd`; converte sem sofrer com fuso horário. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatDate(value: string | null | undefined, style: 'long' | 'short' = 'long'): string {
  const date = parseDate(value)
  if (!date) return '—'
  return style === 'long' ? longDate.format(date) : shortDate.format(date)
}

export function formatDays(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—'
  if (value === 0) return 'Hoje'
  return `${decimal.format(value)} ${value === 1 ? 'dia' : 'dias'}`
}

export const todayISO = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function monthKey(value: string | null | undefined): string | null {
  const date = parseDate(value)
  if (!date) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
    new Date(year, month - 1, 1),
  )
  return `${label.replace('.', '')}/${String(year).slice(2)}`
}

export function daysBetween(from: string | null | undefined, to: string | null | undefined): number | null {
  const start = parseDate(from)
  const end = parseDate(to)
  if (!start || !end) return null
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}
