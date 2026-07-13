import EmailService from '../auth/application/service/email.service'
import FindOrCreateNotificationPreferenceUseCase from './application/usecases/find-or-create-preference.usecase'
import RegisterNotificationUseCase from './application/usecases/register.usecase'
import NotificationDispatcher from './application/service/notification-dispatcher.service'
import NotificationMikroORMRepository from './infrastructure/repositories/mikro-orm/notification.mikroorm.repository'
import NotificationPreferenceMikroORMRepository from './infrastructure/repositories/mikro-orm/notification-preference.mikroorm.repository'

// No hay contenedor de DI en el repo (todo el wiring es manual con `new` en
// cada bootstrap). Esta fabrica evita repetir la misma cadena de construccion
// en cada dominio que dispara notificaciones (coupon-transaction, coupon,
// waste-transaction) -- cada bootstrap solo llama createNotificationDispatcher().
function createNotificationDispatcher(): NotificationDispatcher {
  const notificationRepository = new NotificationMikroORMRepository()
  const preferenceRepository = new NotificationPreferenceMikroORMRepository()

  const findOrCreatePreference = new FindOrCreateNotificationPreferenceUseCase(preferenceRepository)
  const registerNotification = new RegisterNotificationUseCase(notificationRepository)
  const emailService = new EmailService()

  return new NotificationDispatcher(findOrCreatePreference, registerNotification, emailService)
}

export default createNotificationDispatcher
