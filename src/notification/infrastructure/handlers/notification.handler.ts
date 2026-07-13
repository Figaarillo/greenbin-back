import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams } from '../../../shared/utils/http.request.util'
import type ListNotificationsByRecipientUseCase from '../../application/usecases/list-by-recipient.usecase'
import type CountUnreadNotificationsUseCase from '../../application/usecases/count-unread.usecase'
import type MarkNotificationAsReadUseCase from '../../application/usecases/mark-as-read.usecase'
import type MarkAllNotificationsAsReadUseCase from '../../application/usecases/mark-all-as-read.usecase'
import type FindOrCreateNotificationPreferenceUseCase from '../../application/usecases/find-or-create-preference.usecase'
import type UpdateNotificationPreferenceUseCase from '../../application/usecases/update-preference.usecase'
import NotificationSchemaValidator from '../middlewares/notification-schema-validator.middleware'
import UpdateNotificationPreferenceDTO from '../dtos/update-preference.dto'
import type NotificationPreferencePatch from '../../domain/payloads/notification-preference.payload'

class NotificationHandler {
  constructor(
    private readonly listNotifications: ListNotificationsByRecipientUseCase,
    private readonly countUnread: CountUnreadNotificationsUseCase,
    private readonly markAsRead: MarkNotificationAsReadUseCase,
    private readonly markAllAsRead: MarkAllNotificationsAsReadUseCase,
    private readonly findOrCreatePreference: FindOrCreateNotificationPreferenceUseCase,
    private readonly updatePreference: UpdateNotificationPreferenceUseCase
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
}

export default NotificationHandler
