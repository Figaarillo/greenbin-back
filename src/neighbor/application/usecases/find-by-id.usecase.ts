import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class FindNeighborByIDUseCase {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<NeighborEntity> {
    const neighbor = await this.repository.find({ id })
    if (neighbor == null) throw new ErrorNeighborNotFound(id)
    return neighbor
  }
}

export default FindNeighborByIDUseCase
