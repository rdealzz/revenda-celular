import type { Repository } from './repository'

/** Plano B para navegadores com IndexedDB bloqueado (ex.: janela privada). */
export function createLocalStorageRepository<T extends { id: string }>(
  key: string,
): Repository<T> {
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  const write = (items: T[]) => {
    localStorage.setItem(key, JSON.stringify(items))
  }

  return {
    async list() {
      return read()
    },
    async get(id) {
      return read().find((item) => item.id === id)
    },
    async save(item) {
      const items = read()
      const index = items.findIndex((row) => row.id === item.id)
      if (index >= 0) items[index] = item
      else items.push(item)
      write(items)
      return item
    },
    async remove(id) {
      write(read().filter((item) => item.id !== id))
    },
    async replaceAll(items) {
      write(items)
    },
  }
}
