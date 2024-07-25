import type EntityRepository from '../../domain/repositories/entity.repository'

class DeleteEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteEntityUseCase
