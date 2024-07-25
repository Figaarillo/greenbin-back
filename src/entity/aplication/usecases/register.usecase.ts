import EntityEntity from '../../domain/entities/entity.entity'
import ErrorCannotSaveEntity from '../../domain/errors/cannot-save-entity.error'
import type EntityPayload from '../../domain/payloads/entity.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'

class RegisterEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(payload: EntityPayload): Promise<EntityEntity> {
    const newEntity = new EntityEntity(payload)

    const entity = await this.repository.save(newEntity)
    if (entity == null) {
      throw new ErrorCannotSaveEntity('Cannot save new entity')
    }

    return entity
  }
}

export default RegisterEntityUseCase
