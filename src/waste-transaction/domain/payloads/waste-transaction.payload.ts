import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'

interface WasteTransactionPayload {
  responsible: ResponsibleEntity
  neighbor: NeighborEntity
  greenPoint: GreenPointEntity
  transactionDetails: WasteTransactionDetailEntity[]
}

export default WasteTransactionPayload
