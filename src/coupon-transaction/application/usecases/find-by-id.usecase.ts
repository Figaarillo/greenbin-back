import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'
import ErrorCouponTransactionNotFound from '../../domain/errors/coupon-transaction-not-found.error'
import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'

class FindCouponTransactionByIDUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(id: string): Promise<CouponTransactionEntity> {
    const couponTransaction = await this.repository.find({ id })
    if (couponTransaction == null) {
      throw new ErrorCouponTransactionNotFound(id)
    }

    return couponTransaction
  }
}

export default FindCouponTransactionByIDUseCase
