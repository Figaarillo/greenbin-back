import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams } from '../../../shared/utils/http.request.util'
import EnvVar from '../../../shared/config/env-var.config'
import type ListNotificationsByRecipientUseCase from '../../application/usecases/list-by-recipient.usecase'
import type CountUnreadNotificationsUseCase from '../../application/usecases/count-unread.usecase'
import type MarkNotificationAsReadUseCase from '../../application/usecases/mark-as-read.usecase'
import type MarkAllNotificationsAsReadUseCase from '../../application/usecases/mark-all-as-read.usecase'
import type FindOrCreateNotificationPreferenceUseCase from '../../application/usecases/find-or-create-preference.usecase'
import type UpdateNotificationPreferenceUseCase from '../../application/usecases/update-preference.usecase'
import type SubscribePushUseCase from '../../application/usecases/subscribe-push.usecase'
import type UnsubscribePushUseCase from '../../application/usecases/unsubscribe-push.usecase'
import NotificationSchemaValidator from '../middlewares/notification-schema-validator.middleware'
import UpdateNotificationPreferenceDTO from '../dtos/update-preference.dto'
import SubscribePushDTO from '../dtos/subscribe-push.dto'
import UnsubscribePushDTO from '../dtos/unsubscribe-push.dto'
import type NotificationPreferencePatch from '../../domain/payloads/notification-preference.payload'
import type SubscribePushPayload from '../../domain/payloads/subscribe-push.payload'
import type { SseConnectionRegistry } from '../realtime/sse-connection-registry'

class NotificationHandler {
  constructor(
    private readonly listNotifications: ListNotificationsByRecipientUseCase,
    private readonly countUnread: CountUnreadNotificationsUseCase,
    private readonly markAsRead: MarkNotificationAsReadUseCase,
    private readonly markAllAsRead: MarkAllNotificationsAsReadUseCase,
    private readonly findOrCreatePreference: FindOrCreateNotificationPreferenceUseCase,
    private readonly updatePreference: UpdateNotificationPreferenceUseCase,
    private readonly subscribePush: SubscribePushUseCase,
    private readonly unsubscribePush: UnsubscribePushUseCase,
    private readonly realtimeRegistry: SseConnectionRegistry
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    // offset/limit son opcionales acá a proposito (a diferencia de getPaginationParams,
    // que exige que ambos vengan siempre): el uso tipico es GET /api/notifications sin
    // ningun query param, con defaults sensatos.
    const offsetParam = req.query.offset
    const limitParam = req.query.limit
    const offset = offsetParam != null && offsetParam !== '' ? parseInt(offsetParam) : undefined
    const limit = limitParam != null && limitParam !== '' ? parseInt(limitParam) : undefined

    const notifications = await this.listNotifications.exec(req.user.sub, req.user.role, offset, limit)

    HandleHTTPResponse.OK(rep, 'Notifications retrieved successfully', notifications)
  }

  async unreadCount(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const count = await this.countUnread.exec(req.user.sub, req.user.role)

    HandleHTTPResponse.OK(rep, 'Unread notifications count retrieved successfully', { count })
  }

  async markOneAsRead(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')
    const notification = await this.markAsRead.exec(id, req.user.sub, req.user.role)

    HandleHTTPResponse.OK(rep, 'Notification marked as read successfully', notification)
  }

  async markAll(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    await this.markAllAsRead.exec(req.user.sub, req.user.role)

    HandleHTTPResponse.OK(rep, 'All notifications marked as read successfully')
  }

  async getPreference(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const preference = await this.findOrCreatePreference.exec(req.user.sub, req.user.role)

    HandleHTTPResponse.OK(rep, 'Notification preference retrieved successfully', preference)
  }

  async updatePreferenceHandler(
    req: FastifyRequest<{ Body: NotificationPreferencePatch }>,
    rep: FastifyReply
  ): Promise<void> {
    const validator = new NotificationSchemaValidator(UpdateNotificationPreferenceDTO, req.body)
    const patch = validator.exec()

    const preference = await this.updatePreference.exec(req.user.sub, req.user.role, patch)

    HandleHTTPResponse.OK(rep, 'Notification preference updated successfully', preference)
  }

  getPushPublicKey(_req: FastifyRequest, rep: FastifyReply): void {
    HandleHTTPResponse.OK(rep, 'Push public key retrieved successfully', { publicKey: EnvVar.push.publicKey })
  }

  async subscribePushHandler(req: FastifyRequest<{ Body: SubscribePushPayload }>, rep: FastifyReply): Promise<void> {
    const validator = new NotificationSchemaValidator(SubscribePushDTO, req.body)
    const payload = validator.exec()

    await this.subscribePush.exec(req.user.sub, req.user.role, payload)

    HandleHTTPResponse.OK(rep, 'Push subscription registered successfully')
  }

  async unsubscribePushHandler(req: FastifyRequest<{ Body: { endpoint: string } }>, rep: FastifyReply): Promise<void> {
    const validator = new NotificationSchemaValidator(UnsubscribePushDTO, req.body)
    const { endpoint } = validator.exec()

    await this.unsubscribePush.exec(endpoint, req.user.sub, req.user.role)

    HandleHTTPResponse.OK(rep, 'Push subscription removed successfully')
  }

  // Conexion SSE de larga duracion: hijack() le saca a Fastify el control de
  // la respuesta (si no, intenta serializarla/cerrarla como una request normal
  // apenas este metodo retorna). El stream queda abierto hasta que el cliente
  // cierra la conexion (`req.raw` emite 'close').
  streamHandler(req: FastifyRequest, rep: FastifyReply): void {
    // @fastify/cors ya cargo estos headers via reply.header() en su hook
    // onRequest, pero hijack() + writeHead() manual pisan por completo el
    // envio normal de Fastify y se pierden si no se copian aca.
    const corsHeaders: Record<string, string> = {}
    const allowOrigin = rep.getHeader('access-control-allow-origin')
    if (typeof allowOrigin === 'string') corsHeaders['Access-Control-Allow-Origin'] = allowOrigin
    const allowCredentials = rep.getHeader('access-control-allow-credentials')
    if (typeof allowCredentials === 'string') corsHeaders['Access-Control-Allow-Credentials'] = allowCredentials

    rep.hijack()
    rep.raw.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    })
    rep.raw.write(': connected\n\n')

    this.realtimeRegistry.subscribe(req.user.sub, req.user.role, rep)

    // Sin heartbeat, proxies/balanceadores intermedios cortan la conexion por
    // inactividad mucho antes de que haya un evento real que emitir.
    const heartbeat = setInterval(() => {
      rep.raw.write(': heartbeat\n\n')
    }, 25000)

    req.raw.on('close', () => {
      clearInterval(heartbeat)
      this.realtimeRegistry.unsubscribe(req.user.sub, req.user.role, rep)
    })
  }
}

export default NotificationHandler
