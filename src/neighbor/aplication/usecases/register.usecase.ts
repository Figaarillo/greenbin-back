import NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorCannotSaveNeighbor from '../../domain/errors/cannot-save-neighbor.error'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class RegisterNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(payload: NeighborPayload): Promise<NeighborEntity> {
    const newNeighbor = new NeighborEntity(payload)

    const neighbor = await this.repository.save(newNeighbor)
    if (neighbor == null) {
      throw new ErrorCannotSaveNeighbor()
    }

    return neighbor
  }
}

export default RegisterNeighborUseCase
