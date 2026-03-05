import type NeighborEntity from '../../domain/entities/neighbor.entity'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class SubtractNeighborPointsUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(id: string, points: number): Promise<NeighborEntity> {
    if (points <= 0) {
      throw new Error('Points must be greater than 0')
    }

    const neighborUpdated = await this.repository.update(id, { points })
    if (neighborUpdated == null) {
      throw new Error('Error subtracting neighbor points')
    }

    return neighborUpdated
  }
}

export default SubtractNeighborPointsUseCase
