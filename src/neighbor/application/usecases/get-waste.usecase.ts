import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class GetWatesOfNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(id: string): Promise<Partial<NeighborEntity>> {
    const neighbor = await this.repository.findWithWaste({ id })
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(id)
    }

    return {
      id: neighbor.id,
      username: neighbor.username,
      wastes: neighbor.wastes,
      points: neighbor.points
    }
  }
}

export default GetWatesOfNeighborUseCase
