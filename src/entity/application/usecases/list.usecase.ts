import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../domain/repositories/entity.repository'

class ListEntitiesUseCase {
  constructor(private readonly repository: EntityRepository) {}

  async exec(offset: number, limit: number): Promise<EntityEntity[]> {
    const entitiesFounded = await this.repository.list(offset, limit)
    if (entitiesFounded == null) {
      throw new ErrorEntityNotFound()
    }

    return entitiesFounded
  }
}

export default ListEntitiesUseCase
