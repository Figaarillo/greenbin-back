import type EntityEntity from '@entity/domain/entities/entity.entity'
import ErrorEntityNotFound from '@entity/domain/errors/entity-not-found.error'
import type EntityRepository from '@entity/domain/repositories/entity.repository'

class FindEntityByNameUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(name: string): Promise<EntityEntity> {
    const entityFound = await this.repository.Find({ name })
    if (entityFound == null) {
      throw new ErrorEntityNotFound(`Cannont find entity with name: ${name} when get entity by name`)
    }

    return entityFound
  }
}

export default FindEntityByNameUseCase
