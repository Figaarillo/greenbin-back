import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteTransactionEntity from '../entities/waste-transaction.entity'

interface WasteTransactionRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<WasteTransactionEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteTransactionEntity>>
  save: (transaction: WasteTransactionEntity) => Promise<Nullable<WasteTransactionEntity>>
}

export default WasteTransactionRepository
