import EmailService from '../auth/application/service/email.service'
import FindOrCreateNotificationPreferenceUseCase from './application/usecases/find-or-create-preference.usecase'
import RegisterNotificationUseCase from './application/usecases/register.usecase'
import NotificationDispatcher from './application/service/notification-dispatcher.service'
import PushNotificationService from './application/service/push-notification.service'
import NotificationMikroORMRepository from './infrastructure/repositories/mikro-orm/notification.mikroorm.repository'
import NotificationPreferenceMikroORMRepository from './infrastructure/repositories/mikro-orm/notification-preference.mikroorm.repository'
import PushSubscriptionMikroORMRepository from './infrastructure/repositories/mikro-orm/push-subscription.mikroorm.repository'
import sseConnectionRegistry from './infrastructure/realtime/sse-connection-registry'

// No hay contenedor de DI en el repo (todo el wiring es manual con `new` en
// cada bootstrap). Esta fabrica evita repetir la misma cadena de construccion
// en cada dominio que dispara notificaciones (coupon-transaction, coupon,
// waste-transaction) -- cada bootstrap solo llama createNotificationDispatcher().
function createNotificationDispatcher(): NotificationDispatcher {
  const notificationRepository = new NotificationMikroORMRepository()
  const preferenceRepository = new NotificationPreferenceMikroORMRepository()
  const pushSubscriptionRepository = new PushSubscriptionMikroORMRepository()

  const findOrCreatePreference = new FindOrCreateNotificationPreferenceUseCase(preferenceRepository)
  const registerNotification = new RegisterNotificationUseCase(notificationRepository)
  const emailService = new EmailService()
  const pushService = new PushNotificationService(pushSubscriptionRepository)

  return new NotificationDispatcher(
    findOrCreatePreference,
    registerNotification,
    emailService,
    pushService,
    sseConnectionRegistry
  )
}

export default createNotificationDispatcher
