import type FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import DateUtils from '../../../shared/utils/date.util'
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
    const entity = await this.findEntityById.exec(payload.entityId)

    const newNeighbor = new NeighborEntity(
      payload.firstname,
      payload.lastname,
      payload.username,
      payload.email,
      payload.password,
      payload.dni,
      payload.phoneNumber,
      DateUtils.parseDate(payload.birthdate),
      entity
    )

    const neighbor = await this.neighborRepository.save(newNeighbor)
    if (neighbor == null) {
      throw new ErrorCannotSaveNeighbor()
    }

    return neighbor
  }
}

export default RegisterNeighborUseCase
