import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../domain/repositories/entity.repository'

class UpdateEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: { description: string }): Promise<EntityEntity> {
    const entityUpdated = await this.repository.update(id, payload.description)
    if (entityUpdated == null) {
      throw new ErrorEntityNotFound(`Cannot update entity with id: ${id}`)
    }

    return entityUpdated
  }
}

export default UpdateEntityUseCase
