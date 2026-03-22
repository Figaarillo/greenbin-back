import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteTransactionEntity from '../../../waste-transaction/domain/entities/waste-transaction.entity'
import type WasteTransactionDetailEntity from '../entities/waste-transaction-detail.entity'

interface WasteTransactionDetailRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<WasteTransactionDetailEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteTransactionDetailEntity>>
  findWasteTransaction: (property: Record<string, string>) => Promise<Nullable<WasteTransactionEntity>>
  save: (transactionDetail: WasteTransactionDetailEntity) => Promise<Nullable<WasteTransactionDetailEntity>>
}

export default WasteTransactionDetailRepository
