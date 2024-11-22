import type FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorCannotSaveNeighbor from '../../domain/errors/cannot-save-neighbor.error'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class RegisterNeighborUseCase {
  constructor(
    private readonly neighborRepository: NeighborRepository,
    private readonly findEntityById: FindEntityByIDUseCase
  ) {}

  async exec(payload: NeighborPayload): Promise<NeighborEntity> {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!payload.birthdate) {
      throw new Error('Birthdate is required')
    }

    if (payload.birthdate.getFullYear() < 1900) {
      throw new Error('Year must be 1900 or later')
    }

    if (payload.birthdate > new Date()) {
      throw new Error('Date cannot be in the future')
    }

    const entity = await this.findEntityById.exec(payload.entityId)
    const newNeighbor = new NeighborEntity(payload, entity)

    const neighbor = await this.neighborRepository.save(newNeighbor)
    if (neighbor == null) {
      throw new ErrorCannotSaveNeighbor()
    }

    return neighbor
  }
}

export default RegisterNeighborUseCase
