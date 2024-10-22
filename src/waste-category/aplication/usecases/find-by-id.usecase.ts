import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCategoryNotFound from '../../domain/errors/category-not-found.error'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class FindCategoryByIDUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<WasteCategoryEntity> {
    const categoryFound = await this.repository.find({ id })
    if (categoryFound == null) {
      throw new ErrorCategoryNotFound(id)
    }

    return categoryFound
  }
}

export default FindCategoryByIDUseCase
