import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'

class ListByNeighborUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(neighborId: string): Promise<CouponTransactionEntity[]> {
    const transactions = await this.repository.findByNeighbor(neighborId)
    const now = new Date()

    for (const t of transactions) {
      if (t.status === 'ADQUIRIDO' && t.expirationDate < now) {
        t.status = 'EXPIRADO'
        await this.repository.update(t.id, t)
      }
    }

    return transactions
  }
}

export default ListByNeighborUseCase
