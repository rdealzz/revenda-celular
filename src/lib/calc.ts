import type { Device } from '../types'
import { daysBetween, todayISO } from './format'

export interface DeviceFinance {
  /** Soma de todos os gastos avulsos (deslocamento, peças, manutenção…) */
  expensesTotal: number
  /** Valor da compra + todos os gastos */
  totalInvested: number
  /** Valor vendido − valor da compra */
  grossProfit: number | null
  /** Valor vendido − (valor da compra + gastos) */
  netProfit: number | null
  /** Lucro líquido sobre o valor de venda, em % */
  margin: number | null
  /** Lucro líquido sobre o investimento, em % */
  roi: number | null
  /** Dias entre a compra e a venda */
  daysToSell: number | null
  /** Dias desde a compra, para aparelhos ainda não vendidos */
  daysInStock: number | null
  /** Valor anunciado − investimento total, para aparelhos em estoque */
  potentialProfit: number | null
  potentialMargin: number | null
  isSold: boolean
}

const ratio = (part: number, whole: number): number | null =>
  whole > 0 ? (part / whole) * 100 : null

export function calcDevice(device: Device, reference: string = todayISO()): DeviceFinance {
  const expensesTotal = device.expenses.reduce((sum, item) => sum + (item.amount || 0), 0)
  const purchaseAmount = device.purchase.amount || 0
  const totalInvested = purchaseAmount + expensesTotal

  const isSold = device.status === 'vendido' && device.sale.amount !== null
  const soldAmount = isSold ? (device.sale.amount ?? 0) : null

  const grossProfit = soldAmount === null ? null : soldAmount - purchaseAmount
  const netProfit = soldAmount === null ? null : soldAmount - totalInvested

  const askingPrice = device.sale.askingPrice

  return {
    expensesTotal,
    totalInvested,
    grossProfit,
    netProfit,
    margin: netProfit === null || !soldAmount ? null : ratio(netProfit, soldAmount),
    roi: netProfit === null ? null : ratio(netProfit, totalInvested),
    daysToSell: isSold ? daysBetween(device.purchase.date, device.sale.date) : null,
    daysInStock: isSold ? null : daysBetween(device.purchase.date, reference),
    potentialProfit: isSold || !askingPrice ? null : askingPrice - totalInvested,
    potentialMargin:
      isSold || !askingPrice ? null : ratio(askingPrice - totalInvested, askingPrice),
    isSold,
  }
}

export const deviceTitle = (device: Device): string =>
  [device.brand, device.model].filter(Boolean).join(' ').trim() || 'Aparelho sem nome'

export const deviceSubtitle = (device: Device): string =>
  [device.storage, device.ram && `${device.ram} RAM`, device.color]
    .filter(Boolean)
    .join(' · ')
