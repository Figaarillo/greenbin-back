import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborUpdatePayload from '../../domain/payloads/neighbor.update.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class UpdateNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: NeighborUpdatePayload): Promise<NeighborEntity> {
    const neighborUpdated = await this.repository.update(id, payload)
    if (neighborUpdated == null) {
      throw new ErrorNeighborNotFound(id)
    }

    return neighborUpdated
  }
}

export default UpdateNeighborUseCase
