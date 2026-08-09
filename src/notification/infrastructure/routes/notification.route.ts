import { type FastifyInstance, type FastifyRequest } from 'fastify'
import { Roles } from '../../../auth/domain/entities/role'
import type NotificationHandler from '../handlers/notification.handler'
import type NotificationPreferencePatch from '../../domain/payloads/notification-preference.payload'
import type SubscribePushPayload from '../../domain/payloads/subscribe-push.payload'

// Solo estos 3 roles reciben notificaciones en este alcance (ver plan): un
// vecino compra/canjea cupones y recibe entregas, un local crea cupones, un
// responsable registra entregas. Entidad queda afuera a proposito.
const NOTIFIABLE_ROLES = [Roles.NEIGHBOR, Roles.RESPONSIBLE, Roles.REWARD_PARTNER] as const

class NotificationRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: NotificationHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/notifications', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.get('/api/notifications/unread-count', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req, rep) => {
        await this.handler.unreadCount(req, rep)
      }
    })
    this.server.put('/api/notifications/read-all', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req, rep) => {
        await this.handler.markAll(req, rep)
      }
    })
    this.server.put('/api/notifications/:id/read', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.markOneAsRead(req, rep)
      }
    })
    this.server.get('/api/notifications/preferences', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req, rep) => {
        await this.handler.getPreference(req, rep)
      }
    })
    this.server.put('/api/notifications/preferences', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req: FastifyRequest<{ Body: NotificationPreferencePatch }>, rep) => {
        await this.handler.updatePreferenceHandler(req, rep)
      }
    })
    this.server.get('/api/notifications/push/public-key', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: (req, rep) => {
        this.handler.getPushPublicKey(req, rep)
      }
    })
    this.server.post('/api/notifications/push/subscribe', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req: FastifyRequest<{ Body: SubscribePushPayload }>, rep) => {
        await this.handler.subscribePushHandler(req, rep)
      }
    })
    this.server.delete('/api/notifications/push/subscribe', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: async (req: FastifyRequest<{ Body: { endpoint: string } }>, rep) => {
        await this.handler.unsubscribePushHandler(req, rep)
      }
    })
    this.server.get('/api/notifications/stream', {
      preHandler: this.server.protect(...NOTIFIABLE_ROLES),
      handler: (req, rep) => {
        this.handler.streamHandler(req, rep)
      }
    })
  }
}

export default NotificationRoute
