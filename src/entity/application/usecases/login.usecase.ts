import type EntityEntity from '../../domain/entities/entity.entity'
import { EntityRelationships } from '../../domain/enums/entity.enum'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import ErrorInvalidPassword from '../../domain/errors/invalid-password.error'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'

class LoginEntityUseCase {
  constructor(private readonly repository: EntityRepository) {}

  async exec(payload: EntityLoginPayload): Promise<EntityEntity> {
    const entity = await this.findEntity(payload)
    if (entity == null) {
      throw new ErrorEntityNotFound(undefined, payload.email, payload.name)
    }

    const passwordValid = await entity.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidPassword()
    }

    return entity
  }

  private async findEntity(payload: EntityLoginPayload): Promise<EntityEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.findWithPopulate({ email: payload.email }, [EntityRelationships.PASSWORD])
    }

    if (payload.name !== undefined && payload.name !== '') {
      return await this.repository.findWithPopulate({ name: payload.name }, [EntityRelationships.PASSWORD])
    }

    throw new Error('Email or name is required')
  }
}

export default LoginEntityUseCase
