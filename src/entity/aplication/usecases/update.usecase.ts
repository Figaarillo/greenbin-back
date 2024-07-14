import type EntityEntity from '@entity/domain/entities/entity.entity'
import ErrorEntityNotFound from '@entity/domain/errors/entity-not-found.error'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'

class UpdateEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: EntityPayload): Promise<EntityEntity> {
    const entityUpdated = await this.repository.Update(id, payload)
    if (entityUpdated == null) {
      throw new ErrorEntityNotFound(`Cannot update entity with id: ${id}`)
    }

    return entityUpdated
  }
}

export default UpdateEntityUseCase
