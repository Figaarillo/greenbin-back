import type EntityEntity from '@entity/domain/entities/entity.entity'
import ErrorEntityNotFound from '@entity/domain/errors/entity-not-found.error'
import type EntityRepository from '@entity/domain/repositories/entity.repository'

class FindEntityByIDUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<EntityEntity> {
    const entityFound = await this.repository.Find({ id })
    if (entityFound == null) {
      throw new ErrorEntityNotFound(`Cannont find entity with id: ${id} when get entity by id`)
    }

    return entityFound
  }
}

export default FindEntityByIDUseCase
