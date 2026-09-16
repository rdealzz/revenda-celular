/**
 * Contrato de persistência da aplicação.
 *
 * Toda a UI fala apenas com esta interface — nunca com IndexedDB direto.
 * Para migrar no futuro para um banco de dados remoto basta criar uma nova
 * implementação (ex.: `HttpRepository`) e trocá-la em `src/data/index.ts`.
 */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  save(item: T): Promise<T>
  remove(id: string): Promise<void>
  replaceAll(items: T[]): Promise<void>
}
