import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class ListNeighborsUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(offset: number, limit: number): Promise<NeighborEntity[]> {
    const neighbors = await this.repository.list(offset, limit)
    if (neighbors == null || neighbors.length === 0) throw new ErrorNeighborNotFound(undefined, undefined, undefined)
    return neighbors
  }
}

export default ListNeighborsUseCase
