import ErrorInvalidCredentialsProvided from '../../../shared/domain/errors/invalid-credentials.error'
import type EntityEntity from '../../domain/entities/entity.entity'
import { EntityRelationships } from '../../domain/enums/entity.enum'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'

class LoginEntityUseCase {
  constructor(private readonly repository: EntityRepository) {}

  async exec(payload: EntityLoginPayload): Promise<EntityEntity> {
    const entity = await this.findEntity(payload)
    if (entity == null) {
      throw new ErrorInvalidCredentialsProvided()
    }

    const passwordValid = await entity.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidCredentialsProvided()
    }

    return entity
  }

  private async findEntity(payload: EntityLoginPayload): Promise<EntityEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.find({ email: payload.email }, [EntityRelationships.PASSWORD])
    }

    if (payload.name !== undefined && payload.name !== '') {
      return await this.repository.find({ name: payload.name }, [EntityRelationships.PASSWORD])
    }

    throw new Error('Email or name is required')
  }
}

export default LoginEntityUseCase
