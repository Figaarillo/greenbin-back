import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteTransactionDetailEntity from '../entities/waste-transaction-detail.entity'

interface WasteTransactionDetailRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<WasteTransactionDetailEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteTransactionDetailEntity>>
  save: (transactionDetail: WasteTransactionDetailEntity) => Promise<Nullable<WasteTransactionDetailEntity>>
}

export default WasteTransactionDetailRepository
