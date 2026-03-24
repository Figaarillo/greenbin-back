import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'

class ListByNeighborUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(neighborId: string): Promise<CouponTransactionEntity[]> {
    return await this.repository.findByNeighbor(neighborId)
  }
}

export default ListByNeighborUseCase
