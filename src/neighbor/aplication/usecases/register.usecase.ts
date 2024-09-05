import NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorCannotSaveNeighbor from '../../domain/errors/cannot-save-neighbor.error'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class RegisterNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(payload: NeighborPayload): Promise<NeighborEntity> {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!payload.birthdate) {
      throw new Error('Birthdate is required')
    }

    if (payload.birthdate.getFullYear() < 1900) {
      throw new Error('Year must be 1900 or later')
    }

    if (payload.birthdate > new Date()) {
      throw new Error('Date cannot be in the future')
    }

    const newNeighbor = new NeighborEntity(payload)

    const neighbor = await this.repository.save(newNeighbor)
    if (neighbor == null) {
      throw new ErrorCannotSaveNeighbor()
    }

    return neighbor
  }
}

export default RegisterNeighborUseCase
