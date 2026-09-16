export type DeviceStatus = 'estoque' | 'reservado' | 'vendido'

export type DeviceCondition =
  | 'novo'
  | 'seminovo'
  | 'usado'
  | 'com-marcas'
  | 'com-defeito'

export interface Expense {
  id: string
  description: string
  amount: number
}

export interface Purchase {
  /** ISO date (yyyy-mm-dd) */
  date: string
  amount: number
  seller: string
  city: string
  listingUrl: string
}

export interface Sale {
  /** Preço anunciado / pretendido */
  askingPrice: number | null
  /** ISO date (yyyy-mm-dd) */
  date: string
  amount: number | null
  customer: string
  city: string
  paymentMethod: string
  notes: string
}

export interface Device {
  id: string
  brand: string
  model: string
  color: string
  storage: string
  ram: string
  imei: string
  condition: DeviceCondition
  notes: string
  /** dataURL da foto (opcional) */
  photo: string | null
  purchase: Purchase
  expenses: Expense[]
  sale: Sale
  status: DeviceStatus
  tags: string[]
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Backup {
  app: 'revenda-celular'
  version: number
  exportedAt: string
  devices: Device[]
}
