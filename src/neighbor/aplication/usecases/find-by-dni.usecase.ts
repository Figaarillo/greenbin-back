import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class FindNeighborByDniUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(dni: string): Promise<NeighborEntity> {
    const neighbor = await this.repository.find({ dni })
    if (neighbor == null) throw new ErrorNeighborNotFound(undefined, undefined, undefined, dni)
    return neighbor
  }
}

export default FindNeighborByDniUseCase
