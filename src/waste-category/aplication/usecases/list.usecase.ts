import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCategoryNotFound from '../../domain/errors/category-not-found.error'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class ListCategoriesUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {}

  async exec(offset: number, limit: number): Promise<WasteCategoryEntity[]> {
    const entitiesFounded = await this.repository.list(offset, limit)
    if (entitiesFounded == null) {
      throw new ErrorCategoryNotFound()
    }

    return entitiesFounded
  }
}

export default ListCategoriesUseCase
