import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class ListGreenPointsUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(offset: number, limit: number, entityId?: string): Promise<GreenPointEntity[]> {
    const greenPoints = await this.repository.list(offset, limit, entityId)
    if (greenPoints == null) {
      throw new ErrorGreenPointNotFound()
    }

    return greenPoints
  }
}

export default ListGreenPointsUseCase
