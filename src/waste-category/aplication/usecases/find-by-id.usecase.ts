import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCategoryNotFound from '../../domain/errors/category-not-found.error'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class FindWasteCategoryByIDUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {}

  async exec(id: string): Promise<WasteCategoryEntity> {
    const categoryFound = await this.repository.find({ id })
    if (categoryFound == null) {
      throw new ErrorCategoryNotFound(id)
    }

    return categoryFound
  }
}

export default FindWasteCategoryByIDUseCase
