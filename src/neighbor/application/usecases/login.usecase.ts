import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorInvalidPassword from '../../domain/errors/invalid-password.error'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborLoginPayload from '../../domain/payloads/neighbor.login.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class LoginNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(payload: NeighborLoginPayload): Promise<NeighborEntity> {
    const neighbor = await this.findNeighbor(payload)
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(undefined, payload.email, payload.username)
    }

    const passwordValid = await neighbor.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidPassword()
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

    throw new Error('Email or username is required')
  }
}

export default LoginNeighborUseCase
