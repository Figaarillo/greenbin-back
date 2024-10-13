import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class ListGreenPointsUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(offset: number, limit: number): Promise<GreenPointEntity[]> {
    const entitiesFounded = await this.repository.list(offset, limit)
    if (entitiesFounded == null || entitiesFounded.length === 0) {
      throw new ErrorGreenPointNotFound(undefined, undefined)
    }

    return entitiesFounded
  }
}

export default ListGreenPointsUseCase
