import type EmailService from '../../../auth/application/service/email.service'
import type { Roles } from '../../../auth/domain/entities/role'
import type { NotificationCategory } from '../../domain/enums/notification-category.enum'
import type FindOrCreateNotificationPreferenceUseCase from '../usecases/find-or-create-preference.usecase'
import type RegisterNotificationUseCase from '../usecases/register.usecase'

interface NotificationEvent {
  recipientId: string
  recipientRole: Roles
  category: NotificationCategory
  title: string
  body: string
  /** Closure: cada use case decide qué método de EmailService llamar y con qué
   *  argumentos. El dispatcher no necesita conocer la firma de cada mail.
   *  Si se omite, el evento solo genera notificación in-app (sin mail). */
  sendEmail?: (emailService: EmailService) => Promise<void>
}

/**
 * Aísla el envío de notificaciones (in-app + email) de la transacción de
 * negocio que las dispara: ningún fallo acá (SMTP caído, error al persistir
 * la notificación) debe romper una compra/canje/entrega ya confirmada en DB.
 * Se llama con `void dispatcher.dispatch(...)` (sin await) desde los use
 * cases, para que además la latencia de Gmail no demore la respuesta HTTP.
 */
class NotificationDispatcher {
  constructor(
    private readonly findOrCreatePreference: FindOrCreateNotificationPreferenceUseCase,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly emailService: EmailService
  ) {}

  async dispatch(event: NotificationEvent): Promise<void> {
    const preference = await this.safeFindPreference(event.recipientId, event.recipientRole)
    // Si no se puede leer la preferencia, se asume habilitado: mejor notificar
    // de más que perder un evento por un problema ajeno a la preferencia en sí.
    if (preference != null && !preference.isEnabledFor(event.category)) return

    try {
      await this.registerNotification.exec(event)
    } catch (error) {
      console.error('[NotificationDispatcher] no se pudo persistir la notificación in-app', error)
    }

    if (event.sendEmail == null) return

    try {
      await event.sendEmail(this.emailService)
    } catch (error) {
      console.error('[NotificationDispatcher] no se pudo enviar el mail de notificación', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async safeFindPreference(recipientId: string, recipientRole: Roles) {
    try {
      return await this.findOrCreatePreference.exec(recipientId, recipientRole)
    } catch (error) {
      console.error('[NotificationDispatcher] no se pudo leer preferencias, se asume habilitado', error)
      return null
    }
  }
}

export default NotificationDispatcher
export type { NotificationEvent }
