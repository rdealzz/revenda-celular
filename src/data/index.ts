import type { Device } from '../types'
import { createIndexedDbRepository, isIndexedDbAvailable, STORE_DEVICES } from './indexedDb'
import { createLocalStorageRepository } from './localStorage'
import type { Repository } from './repository'

export type { Repository } from './repository'

export const deviceRepository: Repository<Device> = isIndexedDbAvailable()
  ? createIndexedDbRepository<Device>(STORE_DEVICES)
  : createLocalStorageRepository<Device>('revenda-celular:devices')
