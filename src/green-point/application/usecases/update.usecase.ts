import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../domain/errors/green-point-not-found.error'
import type GreenPointUpdatePayload from '../../domain/payloads/green-point.update.payload'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class UpdateGreenPointUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(id: string, payload: GreenPointUpdatePayload): Promise<GreenPointEntity> {
    const greenPoint = await this.repository.update(id, payload)
    if (greenPoint == null) {
      throw new ErrorGreenPointNotFound(id)
    }

    return greenPoint
  }
}

export default UpdateGreenPointUseCase
