import type { Repository } from './repository'

const DB_NAME = 'revenda-celular'
const DB_VERSION = 1

export const STORE_DEVICES = 'devices'

let connection: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (connection) return connection

  connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_DEVICES)) {
        db.createObjectStore(STORE_DEVICES, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return connection
}

function run<T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | null,
): Promise<T | undefined> {
  return openDatabase().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const request = action(tx.objectStore(storeName))
        let result: T | undefined

        if (request) request.onsuccess = () => (result = request.result)
        tx.oncomplete = () => resolve(result)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

export function createIndexedDbRepository<T extends { id: string }>(
  storeName: string,
): Repository<T> {
  return {
    async list() {
      const rows = await run<T[]>(storeName, 'readonly', (store) => store.getAll())
      return rows ?? []
    },
    async get(id) {
      return run<T>(storeName, 'readonly', (store) => store.get(id))
    },
    async save(item) {
      await run(storeName, 'readwrite', (store) => store.put(item))
      return item
    },
    async remove(id) {
      await run(storeName, 'readwrite', (store) => store.delete(id))
    },
    async replaceAll(items) {
      await openDatabase().then(
        (db) =>
          new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite')
            const store = tx.objectStore(storeName)
            store.clear()
            for (const item of items) store.put(item)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
            tx.onabort = () => reject(tx.error)
          }),
      )
    },
  }
}
