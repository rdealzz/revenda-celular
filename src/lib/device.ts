import type { Device } from '../types'
import { createId } from './id'
import { todayISO } from './format'

export function createDevice(partial: Partial<Device> = {}): Device {
  const now = new Date().toISOString()
  return {
    id: createId(),
    brand: '',
    model: '',
    color: '',
    storage: '',
    ram: '',
    imei: '',
    condition: 'seminovo',
    notes: '',
    photo: null,
    purchase: { date: todayISO(), amount: 0, seller: '', city: '', listingUrl: '' },
    expenses: [],
    sale: {
      askingPrice: null,
      date: '',
      amount: null,
      customer: '',
      city: '',
      paymentMethod: '',
      notes: '',
    },
    status: 'estoque',
    tags: [],
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

/** Cópia pronta para um novo cadastro: mantém a ficha técnica, zera a venda. */
export function duplicateDevice(device: Device): Device {
  return createDevice({
    ...structuredClone(device),
    id: createId(),
    status: 'estoque',
    imei: '',
    photo: device.photo,
    sale: {
      askingPrice: device.sale.askingPrice,
      date: '',
      amount: null,
      customer: '',
      city: '',
      paymentMethod: '',
      notes: '',
    },
    expenses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/** Normaliza registros vindos de backups antigos ou parcialmente preenchidos. */
export function normalizeDevice(input: Partial<Device>): Device {
  const base = createDevice()
  return {
    ...base,
    ...input,
    id: input.id ?? base.id,
    purchase: { ...base.purchase, ...input.purchase },
    sale: { ...base.sale, ...input.sale },
    expenses: (input.expenses ?? []).map((expense) => ({
      id: expense.id ?? createId(),
      description: expense.description ?? '',
      amount: Number(expense.amount) || 0,
    })),
    tags: input.tags ?? [],
  }
}
