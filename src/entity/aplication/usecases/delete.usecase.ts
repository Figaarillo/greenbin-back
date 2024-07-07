import type EntityRepository from '@entity/domain/repositories/entity.repository'

class DeleteEntity {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<void> {
    await this.repository.Delete(id)
  }
}

export default DeleteEntity
