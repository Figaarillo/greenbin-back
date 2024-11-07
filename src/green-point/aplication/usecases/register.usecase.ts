import GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorCannotSaveGreenPoint from '../../domain/errors/cannot-save-green-point.error'
import type GreenPointPayload from '../../domain/payloads/green-point.payload'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class RegisterGreenPointUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(payload: GreenPointPayload): Promise<GreenPointEntity> {
    const newGreenPoint = new GreenPointEntity(payload)

    const GreenPoint = await this.repository.save(newGreenPoint)
    if (GreenPoint == null) {
      throw new ErrorCannotSaveGreenPoint()
    }

    return GreenPoint
  }
}

export default RegisterGreenPointUseCase
