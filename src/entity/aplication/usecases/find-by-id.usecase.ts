import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../domain/repositories/entity.repository'

class FindEntityByIDUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<EntityEntity> {
    const entityFound = await this.repository.find({ id })
    if (entityFound == null) {
      throw new ErrorEntityNotFound(id)
    }

    return entityFound
  }
}

export default FindEntityByIDUseCase
