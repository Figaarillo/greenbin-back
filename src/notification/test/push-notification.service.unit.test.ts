import { describe, expect, it, vi } from 'vitest'
import webpushImport from 'web-push'
import { Roles } from '../../auth/domain/entities/role'
import PushSubscriptionEntity from '../domain/entities/push-subscription.entity'
import type PushSubscriptionRepository from '../domain/repositories/push-subscription.repository'
import PushNotificationService from '../application/service/push-notification.service'

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn()
  }
}))

const webpush = webpushImport as unknown as {
  setVapidDetails: ReturnType<typeof vi.fn>
  sendNotification: ReturnType<typeof vi.fn>
}

function makeSubscription(endpoint: string): PushSubscriptionEntity {
  return new PushSubscriptionEntity('neighbor-1', Roles.NEIGHBOR, endpoint, 'p256dh-key', 'auth-key')
}

describe('PushNotificationService — unit tests', () => {
  it('envía el push a todas las suscripciones del destinatario', async () => {
    const subscriptions = [makeSubscription('https://push.example/a'), makeSubscription('https://push.example/b')]
    const repository: Partial<PushSubscriptionRepository> = {
      findByRecipient: async () => subscriptions,
      deleteByEndpoint: vi.fn()
    }
    webpush.sendNotification.mockResolvedValue(undefined)

    const service = new PushNotificationService(repository as PushSubscriptionRepository)
    await service.sendToRecipient('neighbor-1', Roles.NEIGHBOR, { title: 'Título', body: 'Cuerpo' })

    expect(webpush.sendNotification).toHaveBeenCalledTimes(2)
    expect(repository.deleteByEndpoint).not.toHaveBeenCalled()
  })

  it('borra la suscripción cuando el navegador la invalidó (410)', async () => {
    const subscription = makeSubscription('https://push.example/gone')
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByRecipient: async () => [subscription],
      deleteByEndpoint
    }
    webpush.sendNotification.mockRejectedValueOnce({ statusCode: 410 })

    const service = new PushNotificationService(repository as PushSubscriptionRepository)
    await expect(
      service.sendToRecipient('neighbor-1', Roles.NEIGHBOR, { title: 'Título', body: 'Cuerpo' })
    ).resolves.toBeUndefined()

    expect(deleteByEndpoint).toHaveBeenCalledWith('https://push.example/gone')
  })

  it('no rompe ni borra la suscripción ante otros errores de envío', async () => {
    const subscription = makeSubscription('https://push.example/error')
    const deleteByEndpoint = vi.fn()
    const repository: Partial<PushSubscriptionRepository> = {
      findByRecipient: async () => [subscription],
      deleteByEndpoint
    }
    webpush.sendNotification.mockRejectedValueOnce({ statusCode: 500 })

    const service = new PushNotificationService(repository as PushSubscriptionRepository)
    await expect(
      service.sendToRecipient('neighbor-1', Roles.NEIGHBOR, { title: 'Título', body: 'Cuerpo' })
    ).resolves.toBeUndefined()

    expect(deleteByEndpoint).not.toHaveBeenCalled()
  })
})
