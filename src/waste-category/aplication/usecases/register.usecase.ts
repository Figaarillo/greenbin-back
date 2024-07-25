import WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCannotSaveCategory from '../../domain/errors/cannot-save-category.error'
import type WasteCategoryPayload from '../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class RegisterWasteCategoryUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {
    this.repository = repository
  }

  async exec(payload: WasteCategoryPayload): Promise<WasteCategoryEntity> {
    const newCategory = new WasteCategoryEntity(payload)

    const category = await this.repository.save(newCategory)
    if (category == null) {
      throw new ErrorCannotSaveCategory('Cannot save new waste category')
    }

    return category
  }
}

export default RegisterWasteCategoryUseCase
