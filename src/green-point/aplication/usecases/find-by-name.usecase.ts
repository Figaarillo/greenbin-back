import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class FindByNameUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(name: string): Promise<GreenPointEntity> {
    const GreenPoint = await this.repository.find({ name })
    if (GreenPoint == null) {
      throw new ErrorGreenPointNotFound(undefined, name)
    }

    return GreenPoint
  }
}

export default FindByNameUseCase
