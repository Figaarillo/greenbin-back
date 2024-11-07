import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class FindByNameUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(name: string): Promise<GreenPointEntity> {
    const greenPoint = await this.repository.find({ name })
    if (greenPoint == null) {
      throw new ErrorGreenPointNotFound(undefined, name)
    }

    greenPoint.coordinates = JSON.parse(greenPoint.coordinates as unknown as string)

    return greenPoint
  }
}

export default FindByNameUseCase
