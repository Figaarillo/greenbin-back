import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class ListGreenPointsUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(offset: number, limit: number): Promise<GreenPointEntity[]> {
    const greenPointsFounded = await this.repository.list(offset, limit)
    if (greenPointsFounded == null || greenPointsFounded.length === 0) {
      throw new ErrorGreenPointNotFound(undefined, undefined)
    }

    greenPointsFounded.forEach(greenPoint => {
      greenPoint.coordinates = JSON.parse(greenPoint.coordinates as unknown as string)
    })

    return greenPointsFounded
  }
}

export default ListGreenPointsUseCase
