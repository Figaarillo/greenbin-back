import ErrorCategoryNotFound from '../../../waste-category/domain/errors/category-not-found.error'
import WasteEntity from '../../domain/entities/waste.entity'
import ErrorCannotSaveWaste from '../../domain/errors/cannot-save-waste.error'
import type WastePayload from '../../domain/payloads/waste.payload'
import type WasteRepository from '../../domain/repositories/waste.repository'

class RegisterWasteUseCase {
  constructor(private readonly repository: WasteRepository) {}

  async exec(payload: WastePayload): Promise<WasteEntity> {
    const categoryId = payload.category as unknown as string
    const category = await this.repository.findCategory({ id: categoryId })
    if (category == null) {
      throw new ErrorCategoryNotFound(categoryId)
    }

    const newWaste = new WasteEntity({ ...payload, pointsPerWeight: category.pointsPerWeight })

    console.log({ newWaste, where: 'in usecase' })
    const waste = await this.repository.save(newWaste)
    if (waste == null) {
      throw new ErrorCannotSaveWaste()
    }

    return waste
  }
}

export default RegisterWasteUseCase
