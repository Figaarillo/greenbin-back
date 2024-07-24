import EntityEntity from '@entity/domain/entities/entity.entity'
import ErrorCannotSaveEntity from '@entity/domain/errors/cannot-save-entity.error'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'

class RegisterEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(payload: EntityPayload): Promise<EntityEntity> {
    const newEntity = new EntityEntity(payload)

    const Entity = await this.repository.Save(newEntity)
    if (Entity == null) {
      throw new ErrorCannotSaveEntity('Cannot save new entity')
    }

    return Entity
  }
}

export default RegisterEntityUseCase
