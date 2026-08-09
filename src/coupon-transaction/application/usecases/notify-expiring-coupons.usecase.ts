import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'

const DEFAULT_WITHIN_DAYS = 3

// Corrido por un job diario (ver coupon-transaction.bootstrap.ts), no por un
// endpoint HTTP: no hay actor ni request, por eso no vive en un handler.
class NotifyExpiringCouponsUseCase {
  constructor(
    private readonly repository: CouponTransactionRepository,
    private readonly notificationDispatcher: NotificationDispatcher
  ) {}

  async exec(withinDays: number = DEFAULT_WITHIN_DAYS): Promise<number> {
    const expiring = await this.repository.findExpiringSoon(withinDays)

    for (const transaction of expiring) {
      void this.notificationDispatcher.dispatch({
        recipientId: transaction.neighbor.id,
        recipientRole: Roles.NEIGHBOR,
        category: NotificationCategory.COUPON_EXPIRING_SOON,
        title: 'Tu cupón está por vencer',
        body: `"${transaction.coupon.title}" vence el ${transaction.expirationDate.toLocaleDateString('es-AR')}.`,
        data: { transactionId: transaction.id, couponId: transaction.coupon.id },
        sendEmail: async emailService => {
          await emailService.sendCouponExpiringSoon(
            transaction.neighbor.email,
            `${transaction.neighbor.firstname} ${transaction.neighbor.lastname}`,
            transaction.coupon.title,
            transaction.expirationDate
          )
        }
      })

      // Se marca aunque la preferencia del vecino esté deshabilitada: el punto
      // es "ya evaluamos este cupón para este vecino", no "se le mostró algo".
      // Si se reintentara en cada corrida por tener la categoría apagada, el
      // job se volvería cada vez más lento sin ningún beneficio (el vecino
      // igual no la va a ver).
      await this.repository.markExpirationNotified(transaction.id)
    }

    return expiring.length
  }
}

export default NotifyExpiringCouponsUseCase
