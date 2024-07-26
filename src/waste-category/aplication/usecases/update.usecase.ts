import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCategoryNotFound from '../../domain/errors/category-not-found.error'
import type WasteCategoryPayload from '../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class UpdateCategoryUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: WasteCategoryPayload): Promise<WasteCategoryEntity> {
    const categoryUpdated = await this.repository.update(id, payload)
    if (categoryUpdated == null) {
      throw new ErrorCategoryNotFound(`Cannot update waste category with id: ${id}`)
    }

    return categoryUpdated
  }
}

export default UpdateCategoryUseCase
