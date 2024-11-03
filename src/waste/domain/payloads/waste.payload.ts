import type WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

interface WastePayload {
  category: WasteCategoryEntity
  weight: number
  pointsPerWeight: number
}

export default WastePayload
