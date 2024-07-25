import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'

class DeleteCategoryUseCase {
  constructor(private readonly repository: WasteCategoryRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteCategoryUseCase
