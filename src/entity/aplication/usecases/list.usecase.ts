import type EntityEntity from '@entity/domain/entities/entity.entity'
import ErrorEntityNotFound from '@entity/domain/errors/entity-not-found.error'
import type EntityRepository from '@entity/domain/repositories/entity.repository'

class ListEntitiesUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(offset: number, limit: number): Promise<EntityEntity[]> {
    const entitiesFounded = await this.repository.List(offset, limit)
    if (entitiesFounded == null) {
      throw new ErrorEntityNotFound('Cannot find any entity when try to list all entities')
    }

    if (entitiesFounded.length === 0) {
      throw new ErrorEntityNotFound('Cannot find any entity when try to list all entities')
    }

    return entitiesFounded
  }
}

export default ListEntitiesUseCase
