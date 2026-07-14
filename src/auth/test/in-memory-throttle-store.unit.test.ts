import { afterEach, describe, expect, it, vi } from 'vitest'
import InMemoryThrottleStoreRepository from '../infrastructure/repositories/in-memory-throttle-store.repository'

describe('InMemoryThrottleStoreRepository — unit tests', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('hit()', () => {
    it('devuelve 1 en el primer hit para una key nueva', async () => {
      const store = new InMemoryThrottleStoreRepository()
      const count = await store.hit('neighbor@test.com:127.0.0.1')
      expect(count).toBe(1)
    })

    it('incrementa el contador en hits sucesivos para la misma key', async () => {
      const store = new InMemoryThrottleStoreRepository()
      const key = 'entity@test.com:10.0.0.5'

      await store.hit(key)
      await store.hit(key)
      const third = await store.hit(key)

      expect(third).toBe(3)
    })

    it('mantiene contadores independientes para keys distintas (email+IP compuesto)', async () => {
      const store = new InMemoryThrottleStoreRepository()

      await store.hit('a@test.com:127.0.0.1')
      await store.hit('a@test.com:127.0.0.1')
      const other = await store.hit('b@test.com:127.0.0.1')

      expect(other).toBe(1)
    })

    it('expira el contador pasado el TTL y vuelve a contar desde 1', async () => {
      vi.useFakeTimers()
      const ttlMs = 1000
      const store = new InMemoryThrottleStoreRepository(ttlMs)
      const key = 'ttl@test.com:127.0.0.1'

      await store.hit(key)
      await store.hit(key)

      vi.advanceTimersByTime(ttlMs + 1)

      const afterExpiry = await store.hit(key)
      expect(afterExpiry).toBe(1)
    })
  })

  describe('reset()', () => {
    it('limpia el contador de una key: el próximo hit vuelve a empezar en 1', async () => {
      const store = new InMemoryThrottleStoreRepository()
      const key = 'reset@test.com:127.0.0.1'

      await store.hit(key)
      await store.hit(key)
      await store.reset(key)

      const afterReset = await store.hit(key)
      expect(afterReset).toBe(1)
    })

    it('resetear una key inexistente no lanza error', async () => {
      const store = new InMemoryThrottleStoreRepository()
      await expect(store.reset('nunca-usada@test.com:0.0.0.0')).resolves.not.toThrow()
    })
  })
})
