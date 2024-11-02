import type WasteEntity from '../../../waste/domain/entities/waste.entity'

interface WasteTransactionDetailPayload {
  waste: WasteEntity
}

export default WasteTransactionDetailPayload
