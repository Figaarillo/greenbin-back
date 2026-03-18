import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type UseCouponPayload from '../../domain/payloads/use-coupon.payload'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'

class UseCouponUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(payload: UseCouponPayload): Promise<{ transaction: CouponTransactionEntity; finalAmount: number }> {
    const transaction = await this.repository.findByCode(payload.code)

    if (transaction == null) {
      throw new Error('Código de cupón no encontrado.')
    }

    if (transaction.rewardPartner.id !== payload.rewardPartnerId) {
      throw new Error('El cupón no pertenece a este local.')
    }

    if (transaction.status !== 'ADQUIRIDO') {
      throw new Error('El cupón no está disponible para usar.')
    }

    const now = new Date()
    if (now > transaction.expirationDate) {
      throw new Error('El cupón ha expirado.')
    }

    const discount = transaction.coupon.discount
    const finalAmount = payload.totalAmount - (payload.totalAmount * discount) / 100

    transaction.status = 'USADO'
    transaction.redeemDate = now

    await this.repository.update(transaction.id, transaction)

    return { transaction, finalAmount }
  }
}

export default UseCouponUseCase
