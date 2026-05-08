import type WastePayload from '../../../waste/domain/payloads/waste.payload'

interface WasteDeliveryPayload {
  responsibleId: string
  neighborId: string
  greenPointId: string
  wastes: WastePayload[]
}

export default WasteDeliveryPayload
