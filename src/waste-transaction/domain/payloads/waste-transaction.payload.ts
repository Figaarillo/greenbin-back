import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'

interface WasteTransactionPayload {
  responsible: ResponsibleEntity
  neighbor: NeighborEntity
  greenPoint: GreenPointEntity
}

export default WasteTransactionPayload
