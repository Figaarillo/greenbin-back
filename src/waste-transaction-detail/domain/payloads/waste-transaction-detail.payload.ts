import type WasteTransactionEntity from '../../../waste-transaction/domain/entities/waste-transaction.entity'
import type WasteEntity from '../../../waste/domain/entities/waste.entity'

interface WasteTransactionDetailPayload {
  waste: WasteEntity
  transaction: WasteTransactionEntity
}

export default WasteTransactionDetailPayload
