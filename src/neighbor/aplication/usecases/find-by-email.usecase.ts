import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class FindByEmailUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(email: string): Promise<NeighborEntity> {
    const neighbor = await this.repository.find({ email })
    if (neighbor == null) throw new ErrorNeighborNotFound(undefined, undefined, email)
    return neighbor
  }
}

export default FindByEmailUseCase
