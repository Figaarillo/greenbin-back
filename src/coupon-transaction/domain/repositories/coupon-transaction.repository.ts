import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponTransactionEntity from '../entities/coupon-transaction.entity'

interface CouponTransactionRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<CouponTransactionEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<CouponTransactionEntity>>
  findResponsible: (property: Record<string, string>) => Promise<Nullable<ResponsibleEntity>>
  findNeighbor: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  fidnGreenPoint: (property: Record<string, string>) => Promise<Nullable<GreenPointEntity>>
  save: (transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  update: (id: string, transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
}

export default CouponTransactionRepository
