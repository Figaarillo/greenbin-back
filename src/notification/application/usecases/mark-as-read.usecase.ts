import type { Roles } from '../../../auth/domain/entities/role'
import ErrorNotificationNotFound from '../../domain/errors/notification-not-found.error'
import type NotificationEntity from '../../domain/entities/notification.entity'
import type NotificationRepository from '../../domain/repositories/notification.repository'

class MarkNotificationAsReadUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async exec(id: string, recipientId: string, recipientRole: Roles): Promise<NotificationEntity> {
    const notification = await this.repository.findById(id)

    // Nunca confiar en que el :id de la URL "ya viene filtrado" por dueño: se
    // re-verifica ownership acá. Si no es del usuario, se responde igual que
    // "no existe" (404), no un 403 -- así no se le confirma a nadie que el id
    // existe pero es de otro usuario.
    if (
      notification == null ||
      notification.recipientId !== recipientId ||
      notification.recipientRole !== recipientRole
    ) {
      throw new ErrorNotificationNotFound()
    }

    notification.markAsRead()
    const updated = await this.repository.update(id, notification)
    if (updated == null) {
      throw new ErrorNotificationNotFound()
    }

    return updated
  }
}

export default MarkNotificationAsReadUseCase
