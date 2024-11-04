import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type WastePayload from '../../../waste/domain/payloads/waste.payload'

interface WasteDeliveryPayload {
  responsible: ResponsibleEntity
  neighbor: NeighborEntity
  greenPoint: GreenPointEntity
  wastes: WastePayload[]
}

export default WasteDeliveryPayload
