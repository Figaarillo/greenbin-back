import { type FastifyInstance } from 'fastify'
import type NotificationRepository from './domain/repositories/notification.repository'
import type NotificationPreferenceRepository from './domain/repositories/notification-preference.repository'
import type PushSubscriptionRepository from './domain/repositories/push-subscription.repository'
import NotificationMikroORMRepository from './infrastructure/repositories/mikro-orm/notification.mikroorm.repository'
import NotificationPreferenceMikroORMRepository from './infrastructure/repositories/mikro-orm/notification-preference.mikroorm.repository'
import PushSubscriptionMikroORMRepository from './infrastructure/repositories/mikro-orm/push-subscription.mikroorm.repository'
import ListNotificationsByRecipientUseCase from './application/usecases/list-by-recipient.usecase'
import CountUnreadNotificationsUseCase from './application/usecases/count-unread.usecase'
import MarkNotificationAsReadUseCase from './application/usecases/mark-as-read.usecase'
import MarkAllNotificationsAsReadUseCase from './application/usecases/mark-all-as-read.usecase'
import FindOrCreateNotificationPreferenceUseCase from './application/usecases/find-or-create-preference.usecase'
import UpdateNotificationPreferenceUseCase from './application/usecases/update-preference.usecase'
import SubscribePushUseCase from './application/usecases/subscribe-push.usecase'
import UnsubscribePushUseCase from './application/usecases/unsubscribe-push.usecase'
import NotificationHandler from './infrastructure/handlers/notification.handler'
import NotificationRoute from './infrastructure/routes/notification.route'
import sseConnectionRegistry from './infrastructure/realtime/sse-connection-registry'

async function bootstrapNotification(router: FastifyInstance): Promise<void> {
  const notificationRepository: NotificationRepository = new NotificationMikroORMRepository()
  const preferenceRepository: NotificationPreferenceRepository = new NotificationPreferenceMikroORMRepository()
  const pushSubscriptionRepository: PushSubscriptionRepository = new PushSubscriptionMikroORMRepository()

  const listNotifications = new ListNotificationsByRecipientUseCase(notificationRepository)
  const countUnread = new CountUnreadNotificationsUseCase(notificationRepository)
  const markAsRead = new MarkNotificationAsReadUseCase(notificationRepository)
  const markAllAsRead = new MarkAllNotificationsAsReadUseCase(notificationRepository)
  const findOrCreatePreference = new FindOrCreateNotificationPreferenceUseCase(preferenceRepository)
  const updatePreference = new UpdateNotificationPreferenceUseCase(findOrCreatePreference, preferenceRepository)
  const subscribePush = new SubscribePushUseCase(pushSubscriptionRepository)
  const unsubscribePush = new UnsubscribePushUseCase(pushSubscriptionRepository)

  const handler = new NotificationHandler(
    listNotifications,
    countUnread,
    markAsRead,
    markAllAsRead,
    findOrCreatePreference,
    updatePreference,
    subscribePush,
    unsubscribePush,
    sseConnectionRegistry
  )

  const routes = new NotificationRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNotification
