import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteTransactionEntity from '../entities/waste-transaction.entity'

interface WasteTransactionRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<WasteTransactionEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteTransactionEntity>>
  findResponsible: (property: Record<string, string>) => Promise<Nullable<ResponsibleEntity>>
  findNeighbor: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  fidnGreenPoint: (property: Record<string, string>) => Promise<Nullable<GreenPointEntity>>
  save: (transaction: WasteTransactionEntity) => Promise<Nullable<WasteTransactionEntity>>
  update: (transaction: WasteTransactionEntity) => Promise<Nullable<WasteTransactionEntity>>
}

export default WasteTransactionRepository
