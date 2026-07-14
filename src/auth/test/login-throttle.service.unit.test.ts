import { describe, expect, it, vi } from 'vitest'
import LoginThrottleService from '../application/service/login-throttle.service'
import ErrorTooManyLoginAttempts from '../domain/errors/too-many-login-attempts.error'
import type ThrottleStore from '../domain/repositories/throttle-store.repository'

function makeStore(hitSequence: number[]): {
  store: ThrottleStore
  hit: ReturnType<typeof vi.fn>
  reset: ReturnType<typeof vi.fn>
} {
  let call = 0
  const hit = vi.fn(async () => {
    const value = hitSequence[call] ?? hitSequence[hitSequence.length - 1]
    call += 1
    return value
  })
  const reset = vi.fn(async () => {})

  return { store: { hit, reset }, hit, reset }
}

describe('LoginThrottleService — unit tests', () => {
  describe('check()', () => {
    it('permite el intento cuando el conteo está por debajo del máximo', async () => {
      const { store } = makeStore([1])
      const service = new LoginThrottleService(store, 5)

      await expect(service.check('a@test.com:127.0.0.1')).resolves.not.toThrow()
    })

    it('permite el intento cuando el conteo es exactamente el máximo', async () => {
      const { store } = makeStore([5])
      const service = new LoginThrottleService(store, 5)

      await expect(service.check('a@test.com:127.0.0.1')).resolves.not.toThrow()
    })

    it('lanza ErrorTooManyLoginAttempts cuando el conteo supera el máximo', async () => {
      const { store } = makeStore([6])
      const service = new LoginThrottleService(store, 5)

      await expect(service.check('a@test.com:127.0.0.1')).rejects.toBeInstanceOf(ErrorTooManyLoginAttempts)
    })

    it('el error de lockout tiene code=429', async () => {
      const { store } = makeStore([10])
      const service = new LoginThrottleService(store, 5)

      try {
        await service.check('a@test.com:127.0.0.1')
        throw new Error('expected check() to throw')
      } catch (error) {
        expect((error as { code: number }).code).toBe(429)
      }
    })

    it('incrementa mediante store.hit() con la key recibida (email+IP compuesto)', async () => {
      const { store, hit } = makeStore([1])
      const service = new LoginThrottleService(store, 5)

      await service.check('someone@test.com:10.0.0.1')

      expect(hit).toHaveBeenCalledWith('someone@test.com:10.0.0.1')
    })

    it('bloquea el 6to intento consecutivo fallido con el umbral por defecto (5)', async () => {
      const { store } = makeStore([1, 2, 3, 4, 5, 6])
      const service = new LoginThrottleService(store)

      for (let i = 0; i < 5; i++) {
        await expect(service.check('lockout@test.com:127.0.0.1')).resolves.not.toThrow()
      }

      await expect(service.check('lockout@test.com:127.0.0.1')).rejects.toBeInstanceOf(ErrorTooManyLoginAttempts)
    })
  })

  describe('recordSuccess()', () => {
    it('llama a store.reset() con la key recibida', async () => {
      const { store, reset } = makeStore([1])
      const service = new LoginThrottleService(store, 5)

      await service.recordSuccess('winner@test.com:127.0.0.1')

      expect(reset).toHaveBeenCalledWith('winner@test.com:127.0.0.1')
      expect(reset).toHaveBeenCalledTimes(1)
    })
  })
})
