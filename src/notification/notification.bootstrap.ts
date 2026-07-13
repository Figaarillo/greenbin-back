import { type FastifyInstance } from 'fastify'
import type NotificationRepository from './domain/repositories/notification.repository'
import type NotificationPreferenceRepository from './domain/repositories/notification-preference.repository'
import NotificationMikroORMRepository from './infrastructure/repositories/mikro-orm/notification.mikroorm.repository'
import NotificationPreferenceMikroORMRepository from './infrastructure/repositories/mikro-orm/notification-preference.mikroorm.repository'
import ListNotificationsByRecipientUseCase from './application/usecases/list-by-recipient.usecase'
import CountUnreadNotificationsUseCase from './application/usecases/count-unread.usecase'
import MarkNotificationAsReadUseCase from './application/usecases/mark-as-read.usecase'
import MarkAllNotificationsAsReadUseCase from './application/usecases/mark-all-as-read.usecase'
import FindOrCreateNotificationPreferenceUseCase from './application/usecases/find-or-create-preference.usecase'
import UpdateNotificationPreferenceUseCase from './application/usecases/update-preference.usecase'
import NotificationHandler from './infrastructure/handlers/notification.handler'
import NotificationRoute from './infrastructure/routes/notification.route'

async function bootstrapNotification(router: FastifyInstance): Promise<void> {
  const notificationRepository: NotificationRepository = new NotificationMikroORMRepository()
  const preferenceRepository: NotificationPreferenceRepository = new NotificationPreferenceMikroORMRepository()

  const listNotifications = new ListNotificationsByRecipientUseCase(notificationRepository)
  const countUnread = new CountUnreadNotificationsUseCase(notificationRepository)
  const markAsRead = new MarkNotificationAsReadUseCase(notificationRepository)
  const markAllAsRead = new MarkAllNotificationsAsReadUseCase(notificationRepository)
  const findOrCreatePreference = new FindOrCreateNotificationPreferenceUseCase(preferenceRepository)
  const updatePreference = new UpdateNotificationPreferenceUseCase(findOrCreatePreference, preferenceRepository)

  const handler = new NotificationHandler(
    listNotifications,
    countUnread,
    markAsRead,
    markAllAsRead,
    findOrCreatePreference,
    updatePreference
  )

  const routes = new NotificationRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNotification
