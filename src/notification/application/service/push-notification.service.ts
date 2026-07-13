import webpush from 'web-push'
import type { Roles } from '../../../auth/domain/entities/role'
import EnvVar from '../../../shared/config/env-var.config'
import type PushSubscriptionRepository from '../../domain/repositories/push-subscription.repository'

interface PushPayload {
  title: string
  body: string
}

class PushNotificationService {
  constructor(private readonly subscriptionRepository: PushSubscriptionRepository) {
    webpush.setVapidDetails(`mailto:${EnvVar.push.contactEmail}`, EnvVar.push.publicKey, EnvVar.push.privateKey)
  }

  async sendToRecipient(recipientId: string, recipientRole: Roles, payload: PushPayload): Promise<void> {
    const subscriptions = await this.subscriptionRepository.findByRecipient(recipientId, recipientRole)

    await Promise.all(
      subscriptions.map(async subscription => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth }
            },
            JSON.stringify({ notification: { title: payload.title, body: payload.body } })
          )
        } catch (error) {
          // 404/410: el navegador invalido la suscripcion (usuario desinstalo,
          // borro datos del sitio, etc.) -- la limpiamos para no reintentar en vano.
          if (this.isGoneError(error)) {
            await this.subscriptionRepository.deleteByEndpoint(subscription.endpoint)
            return
          }
          console.error('[PushNotificationService] no se pudo enviar el push', error)
        }
      })
    )
  }

  private isGoneError(error: unknown): boolean {
    const statusCode = (error as { statusCode?: number } | null)?.statusCode
    return statusCode === 404 || statusCode === 410
  }
}

export default PushNotificationService
export type { PushPayload }
