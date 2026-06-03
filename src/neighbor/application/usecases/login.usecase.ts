import ErrorInvalidCredentialsProvided from '../../../shared/domain/errors/invalid-credentials.error'
import ErrorMissingFields from '../../../shared/domain/errors/missing-filds.error'
import type NeighborEntity from '../../domain/entities/neighbor.entity'
import type NeighborLoginPayload from '../../domain/payloads/neighbor.login.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class LoginNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(payload: NeighborLoginPayload): Promise<NeighborEntity> {
    const neighbor = await this.findNeighbor(payload)
    if (neighbor == null) {
      throw new ErrorInvalidCredentialsProvided()
    }

    const passwordValid = await neighbor.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidCredentialsProvided()
    }

    if (!neighbor.isActive) {
      throw new ErrorInvalidCredentialsProvided(
        'Tu cuenta fue deshabilitada. Contactá a la entidad para más información.'
      )
    }

    return neighbor
  }

  private async findNeighbor(payload: NeighborLoginPayload): Promise<NeighborEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.findWithPassword({ email: payload.email })
    }

    if (payload.username !== undefined && payload.username !== '') {
      return await this.repository.findWithPassword({ username: payload.username })
    }

    throw new ErrorMissingFields(['email', 'username'])
  }
}

export default LoginNeighborUseCase
