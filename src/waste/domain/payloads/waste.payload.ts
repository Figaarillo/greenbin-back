import type WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

interface WastePayload {
  category: WasteCategoryEntity
  weight: number
}

export default WastePayload
