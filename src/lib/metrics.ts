import type { Device } from '../types'
import { calcDevice, deviceTitle, type DeviceFinance } from './calc'
import { classifyExpense } from './expenses'
import { monthKey, monthLabel } from './format'

export interface DeviceWithFinance {
  device: Device
  finance: DeviceFinance
}

export interface Overview {
  investedInStock: number
  potentialSaleValue: number
  potentialProfit: number
  realizedProfit: number
  netProfitTotal: number
  inStockCount: number
  reservedCount: number
  soldCount: number
  averageTicket: number
  averageDaysToSell: number | null
  averageRoi: number | null
  averageMargin: number | null
  travelSpend: number
  maintenanceSpend: number
  otherSpend: number
  totalRevenue: number
  totalInvestedAllTime: number
}

const average = (values: number[]): number | null =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0)

export function withFinance(devices: Device[]): DeviceWithFinance[] {
  return devices.map((device) => ({ device, finance: calcDevice(device) }))
}

export function buildOverview(rows: DeviceWithFinance[]): Overview {
  const sold = rows.filter((row) => row.finance.isSold)
  const open = rows.filter((row) => !row.finance.isSold)

  let travelSpend = 0
  let maintenanceSpend = 0
  let otherSpend = 0

  for (const { device } of rows) {
    for (const expense of device.expenses) {
      const kind = classifyExpense(expense.description)
      if (kind === 'deslocamento') travelSpend += expense.amount || 0
      else if (kind === 'manutencao') maintenanceSpend += expense.amount || 0
      else otherSpend += expense.amount || 0
    }
  }

  const priced = open.filter((row) => row.device.sale.askingPrice)

  return {
    investedInStock: sum(open.map((row) => row.finance.totalInvested)),
    potentialSaleValue: sum(priced.map((row) => row.device.sale.askingPrice ?? 0)),
    potentialProfit: sum(priced.map((row) => row.finance.potentialProfit ?? 0)),
    realizedProfit: sum(sold.map((row) => row.finance.grossProfit ?? 0)),
    netProfitTotal: sum(sold.map((row) => row.finance.netProfit ?? 0)),
    inStockCount: rows.filter((row) => row.device.status === 'estoque').length,
    reservedCount: rows.filter((row) => row.device.status === 'reservado').length,
    soldCount: sold.length,
    averageTicket: average(sold.map((row) => row.device.sale.amount ?? 0)) ?? 0,
    averageDaysToSell: average(
      sold.map((row) => row.finance.daysToSell).filter((value): value is number => value !== null),
    ),
    averageRoi: average(
      sold.map((row) => row.finance.roi).filter((value): value is number => value !== null),
    ),
    averageMargin: average(
      sold.map((row) => row.finance.margin).filter((value): value is number => value !== null),
    ),
    travelSpend,
    maintenanceSpend,
    otherSpend,
    totalRevenue: sum(sold.map((row) => row.device.sale.amount ?? 0)),
    totalInvestedAllTime: sum(rows.map((row) => row.finance.totalInvested)),
  }
}

export interface MonthPoint {
  key: string
  label: string
  purchases: number
  purchaseValue: number
  sales: number
  salesValue: number
  profit: number
  cumulativeProfit: number
  averageDaysToSell: number | null
}

export function buildMonthlySeries(rows: DeviceWithFinance[], months = 12): MonthPoint[] {
  const buckets = new Map<string, MonthPoint & { daysList: number[] }>()

  const ensure = (key: string) => {
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = {
        key,
        label: monthLabel(key),
        purchases: 0,
        purchaseValue: 0,
        sales: 0,
        salesValue: 0,
        profit: 0,
        cumulativeProfit: 0,
        averageDaysToSell: null,
        daysList: [],
      }
      buckets.set(key, bucket)
    }
    return bucket
  }

  for (const { device, finance } of rows) {
    const boughtAt = monthKey(device.purchase.date)
    if (boughtAt) {
      const bucket = ensure(boughtAt)
      bucket.purchases += 1
      bucket.purchaseValue += finance.totalInvested
    }

    if (finance.isSold) {
      const soldAt = monthKey(device.sale.date)
      if (soldAt) {
        const bucket = ensure(soldAt)
        bucket.sales += 1
        bucket.salesValue += device.sale.amount ?? 0
        bucket.profit += finance.netProfit ?? 0
        if (finance.daysToSell !== null) bucket.daysList.push(finance.daysToSell)
      }
    }
  }

  const ordered = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-months)

  let running = 0
  return ordered.map(({ daysList, ...point }) => {
    running += point.profit
    return {
      ...point,
      cumulativeProfit: running,
      averageDaysToSell: average(daysList),
    }
  })
}

export interface BrandStat {
  brand: string
  count: number
  sold: number
  invested: number
  profit: number
  averageDaysToSell: number | null
  averageRoi: number | null
}

export function buildBrandStats(rows: DeviceWithFinance[]): BrandStat[] {
  const map = new Map<string, { rows: DeviceWithFinance[] }>()

  for (const row of rows) {
    const brand = row.device.brand.trim() || 'Sem marca'
    const entry = map.get(brand) ?? { rows: [] }
    entry.rows.push(row)
    map.set(brand, entry)
  }

  return [...map.entries()]
    .map(([brand, { rows: items }]) => {
      const sold = items.filter((item) => item.finance.isSold)
      return {
        brand,
        count: items.length,
        sold: sold.length,
        invested: sum(items.map((item) => item.finance.totalInvested)),
        profit: sum(sold.map((item) => item.finance.netProfit ?? 0)),
        averageDaysToSell: average(
          sold
            .map((item) => item.finance.daysToSell)
            .filter((value): value is number => value !== null),
        ),
        averageRoi: average(
          sold.map((item) => item.finance.roi).filter((value): value is number => value !== null),
        ),
      }
    })
    .sort((a, b) => b.profit - a.profit || b.count - a.count)
}

export interface Highlight {
  label: string
  device: Device | null
  value: string
}

export function pickExtreme(
  rows: DeviceWithFinance[],
  score: (row: DeviceWithFinance) => number | null,
  direction: 'max' | 'min',
): DeviceWithFinance | null {
  let best: DeviceWithFinance | null = null
  let bestScore: number | null = null

  for (const row of rows) {
    const value = score(row)
    if (value === null || Number.isNaN(value)) continue
    if (
      bestScore === null ||
      (direction === 'max' ? value > bestScore : value < bestScore)
    ) {
      best = row
      bestScore = value
    }
  }

  return best
}

export const rowTitle = (row: DeviceWithFinance | null): string =>
  row ? deviceTitle(row.device) : '—'
