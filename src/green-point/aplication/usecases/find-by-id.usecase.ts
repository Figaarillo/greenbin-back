import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class FindGreenPointByIDUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(id: string): Promise<GreenPointEntity> {
    const GreenPointFound = await this.repository.find({ id })
    if (GreenPointFound == null) {
      throw new ErrorGreenPointNotFound(undefined, undefined)
    }

    return GreenPointFound
  }
}

export default FindGreenPointByIDUseCase
