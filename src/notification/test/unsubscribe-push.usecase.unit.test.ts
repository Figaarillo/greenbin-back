import { describe, expect, it, vi } from 'vitest'
import { Roles } from '../../auth/domain/entities/role'
import PushSubscriptionEntity from '../domain/entities/push-subscription.entity'
import type PushSubscriptionRepository from '../domain/repositories/push-subscription.repository'
import UnsubscribePushUseCase from '../application/usecases/unsubscribe-push.usecase'

function makeSubscription(recipientId: string, recipientRole: Roles, endpoint: string): PushSubscriptionEntity {
  return new PushSubscriptionEntity(recipientId, recipientRole, endpoint, 'p256dh-key', 'auth-key')
}

describe('UnsubscribePushUseCase — unit tests', () => {
  it('borra la suscripción cuando el endpoint pertenece a quien la pide', async () => {
    const subscription = makeSubscription('neighbor-1', Roles.NEIGHBOR, 'https://fcm.googleapis.com/fcm/send/a')
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByEndpoint: async () => subscription,
      deleteByEndpoint
    }

    const usecase = new UnsubscribePushUseCase(repository as PushSubscriptionRepository)
    await usecase.exec(subscription.endpoint, 'neighbor-1', Roles.NEIGHBOR)

    expect(deleteByEndpoint).toHaveBeenCalledWith(subscription.endpoint)
  })

  it('no borra si el endpoint es de otro destinatario (IDOR)', async () => {
    const subscription = makeSubscription('neighbor-2', Roles.NEIGHBOR, 'https://fcm.googleapis.com/fcm/send/b')
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByEndpoint: async () => subscription,
      deleteByEndpoint
    }

    const usecase = new UnsubscribePushUseCase(repository as PushSubscriptionRepository)
    await usecase.exec(subscription.endpoint, 'neighbor-1', Roles.NEIGHBOR)

    expect(deleteByEndpoint).not.toHaveBeenCalled()
  })

  it('no borra si el rol del destinatario no coincide', async () => {
    const subscription = makeSubscription('user-1', Roles.RESPONSIBLE, 'https://fcm.googleapis.com/fcm/send/c')
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByEndpoint: async () => subscription,
      deleteByEndpoint
    }

    const usecase = new UnsubscribePushUseCase(repository as PushSubscriptionRepository)
    await usecase.exec(subscription.endpoint, 'user-1', Roles.NEIGHBOR)

    expect(deleteByEndpoint).not.toHaveBeenCalled()
  })

  it('es no-op si el endpoint no existe', async () => {
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByEndpoint: async () => null,
      deleteByEndpoint
    }

    const usecase = new UnsubscribePushUseCase(repository as PushSubscriptionRepository)
    await usecase.exec('https://fcm.googleapis.com/fcm/send/missing', 'neighbor-1', Roles.NEIGHBOR)

    expect(deleteByEndpoint).not.toHaveBeenCalled()
  })
})
