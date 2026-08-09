import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type UseCouponPayload from '../../domain/payloads/use-coupon.payload'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'
import ErrorCouponCodeNotFound from '../../domain/errors/coupon-code-not-found.error'
import { CouponTransactionStateMachine, CouponTransactionStatus } from '../../domain/states'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'

class UseCouponUseCase {
  constructor(
    private readonly repository: CouponTransactionRepository,
    private readonly notificationDispatcher: NotificationDispatcher
  ) {}

  async exec(payload: UseCouponPayload): Promise<CouponTransactionEntity> {
    const transaction = await this.repository.findByCode(payload.code)

    if (transaction == null) {
      throw new ErrorCouponCodeNotFound()
    }

    if (transaction.rewardPartner.id !== payload.rewardPartnerId) {
      throw new Error('El cupón no pertenece a este local.')
    }

    const stateMachine = new CouponTransactionStateMachine(transaction.status as CouponTransactionStatus)
    stateMachine.setExpirationDate(transaction.expirationDate)

    if (!stateMachine.canUse()) {
      if (stateMachine.isExpired()) {
        throw new Error('El cupón ha expirado.')
      }
      throw new Error('El cupón no está disponible para usar.')
    }

    const now = new Date()
    transaction.status = CouponTransactionStatus.USADO
    transaction.redeemDate = now

    await this.repository.update(transaction.id, transaction)

    const updatedTransaction = await this.repository.findById(transaction.id)
    if (updatedTransaction == null) {
      throw new Error('Error updating coupon transaction')
    }

    void this.notificationDispatcher.dispatch({
      recipientId: transaction.neighbor.id,
      recipientRole: Roles.NEIGHBOR,
      category: NotificationCategory.COUPON_REDEEMED,
      title: 'Cupón canjeado',
      body: `Canjeaste "${transaction.coupon.title}" en ${transaction.rewardPartner.name}.`,
      sendEmail: async emailService => {
        await emailService.sendCouponRedeemedConfirmation(
          transaction.neighbor.email,
          `${transaction.neighbor.firstname} ${transaction.neighbor.lastname}`,
          transaction.coupon.title
        )
      }
    })

    return updatedTransaction
  }
}

export default UseCouponUseCase
