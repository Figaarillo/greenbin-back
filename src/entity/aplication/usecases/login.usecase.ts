import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import ErrorInvalidPassword from '../../domain/errors/invalid-password.error'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'

class LoginEntityUseCase {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async exec(payload: EntityLoginPayload): Promise<EntityEntity> {
    const entity = await this.findEntity(payload)

    const passwordValid = await entity.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidPassword()
    }

    return entity
  }

  private async findEntity(payload: EntityLoginPayload): Promise<EntityEntity> {
    let entityByEmail: EntityEntity | null = null
    let entityByName: EntityEntity | null = null

    if (payload.email != null) {
      entityByEmail = await this.repository.findWithPassword({ email: payload.email })
    }

    if (payload.name != null) {
      entityByName = await this.repository.findWithPassword({ name: payload.name })
    }

    if (payload.email != null && entityByEmail == null) {
      throw new ErrorEntityNotFound(undefined, payload.email, undefined)
    }

    if (payload.name != null && entityByName == null) {
      throw new ErrorEntityNotFound(undefined, undefined, payload.name)
    }

    if (entityByEmail != null && entityByName != null && entityByEmail.id !== entityByName.id) {
      throw new ErrorEntityNotFound(undefined, undefined, undefined)
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-non-null-assertion
    return entityByEmail ?? entityByName!
  }
}

export default LoginEntityUseCase
