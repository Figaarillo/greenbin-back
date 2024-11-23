import type FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorCannotSaveGreenPoint from '../../domain/errors/cannot-save-green-point.error'
import type GreenPointPayload from '../../domain/payloads/green-point.payload'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class RegisterGreenPointUseCase {
  constructor(
    private readonly repository: GreenPointRepository,
    private readonly findEntityById: FindEntityByIDUseCase
  ) {}

  async exec(payload: GreenPointPayload): Promise<GreenPointEntity> {
    const entity = await this.findEntityById.exec(payload.entityId)
    const newGreenPoint = new GreenPointEntity(payload, entity)

    const greenPoint = await this.repository.save(newGreenPoint)
    if (greenPoint == null) {
      throw new ErrorCannotSaveGreenPoint()
    }

    return greenPoint
  }
}

export default RegisterGreenPointUseCase
