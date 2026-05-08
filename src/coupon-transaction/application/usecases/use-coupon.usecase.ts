import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type UseCouponPayload from '../../domain/payloads/use-coupon.payload'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'
import ErrorCouponCodeNotFound from '../../domain/errors/coupon-code-not-found.error'
import { CouponTransactionStateMachine, CouponTransactionStatus } from '../../domain/states'

class UseCouponUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(payload: UseCouponPayload): Promise<{ transaction: CouponTransactionEntity; finalAmount: number }> {
    const transaction = await this.repository.findByCode(payload.code)

    if (transaction == null) {
      throw new ErrorCouponCodeNotFound(payload.code)
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

    const discount = transaction.coupon.discount
    const finalAmount = payload.totalAmount - (payload.totalAmount * discount) / 100

    const now = new Date()
    transaction.status = CouponTransactionStatus.USADO
    transaction.redeemDate = now

    await this.repository.update(transaction.id, transaction)

    const updatedTransaction = await this.repository.findById(transaction.id)
    if (updatedTransaction == null) {
      throw new Error('Error updating coupon transaction')
    }
    return { transaction: updatedTransaction, finalAmount }
  }
}

export default UseCouponUseCase
