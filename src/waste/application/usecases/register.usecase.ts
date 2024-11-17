import type FindWasteCategoryByIDUseCase from '../../../waste-category/aplication/usecases/find-by-id.usecase'
import WasteEntity from '../../domain/entities/waste.entity'
import ErrorCannotSaveWaste from '../../domain/errors/cannot-save-waste.error'
import type WastePayload from '../../domain/payloads/waste.payload'
import type WasteRepository from '../../domain/repositories/waste.repository'

class RegisterWasteUseCase {
  constructor(
    private readonly repository: WasteRepository,
    private readonly findCategoryByID: FindWasteCategoryByIDUseCase
  ) {}

  async exec(payload: WastePayload): Promise<WasteEntity> {
    const category = await this.findCategoryByID.exec(payload.categoryId)
    const newWaste = new WasteEntity(category, payload.weight, category.pointsPerWeight)

    const waste = await this.repository.save(newWaste)
    if (waste == null) {
      throw new ErrorCannotSaveWaste()
    }

    return waste
  }
}

export default RegisterWasteUseCase
