import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { deviceRepository } from '../data'
import { duplicateDevice } from '../lib/device'
import type { Device } from '../types'

interface DevicesApi {
  devices: Device[]
  ready: boolean
  save: (device: Device) => Promise<Device>
  remove: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<Device | undefined>
  toggleFavorite: (id: string) => Promise<void>
  replaceAll: (devices: Device[]) => Promise<void>
}

const DevicesContext = createContext<DevicesApi | null>(null)

const byRecent = (a: Device, b: Device) => b.createdAt.localeCompare(a.createdAt)

export function DevicesProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    deviceRepository
      .list()
      .then((rows) => {
        if (!active) return
        setDevices(rows.sort(byRecent))
      })
      .finally(() => active && setReady(true))
    return () => {
      active = false
    }
  }, [])

  const save = useCallback(async (device: Device) => {
    const saved = await deviceRepository.save({ ...device, updatedAt: new Date().toISOString() })
    setDevices((current) => {
      const index = current.findIndex((row) => row.id === saved.id)
      const next = index >= 0 ? current.map((row) => (row.id === saved.id ? saved : row)) : [saved, ...current]
      return next.sort(byRecent)
    })
    return saved
  }, [])

  const remove = useCallback(async (id: string) => {
    await deviceRepository.remove(id)
    setDevices((current) => current.filter((device) => device.id !== id))
  }, [])

  const duplicate = useCallback(
    async (id: string) => {
      const source = devices.find((device) => device.id === id)
      if (!source) return undefined
      return save(duplicateDevice(source))
    },
    [devices, save],
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      const device = devices.find((row) => row.id === id)
      if (!device) return
      await save({ ...device, favorite: !device.favorite })
    },
    [devices, save],
  )

  const replaceAll = useCallback(async (rows: Device[]) => {
    await deviceRepository.replaceAll(rows)
    setDevices([...rows].sort(byRecent))
  }, [])

  const api = useMemo(
    () => ({ devices, ready, save, remove, duplicate, toggleFavorite, replaceAll }),
    [devices, ready, save, remove, duplicate, toggleFavorite, replaceAll],
  )

  return <DevicesContext.Provider value={api}>{children}</DevicesContext.Provider>
}

export function useDevices(): DevicesApi {
  const context = useContext(DevicesContext)
  if (!context) throw new Error('useDevices precisa estar dentro de DevicesProvider')
  return context
}
