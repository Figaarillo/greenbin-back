import type FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorCannotSaveResponsible from '../../domain/errors/cannot-save-responsible.error'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class RegisterResponsibleUseCase {
  constructor(
    private readonly repository: ResponsibleRepository,
    private readonly findEntityById: FindEntityByIDUseCase
  ) {}

  async exec(payload: ResponsiblePayload): Promise<ResponsibleEntity> {
    const entity = await this.findEntityById.exec(payload.entityId)
    const newResponsible = new ResponsibleEntity(payload, entity)

    const responsible = await this.repository.save(newResponsible)
    if (responsible == null) {
      throw new ErrorCannotSaveResponsible('Cannot save new responsible')
    }

    return responsible
  }
}

export default RegisterResponsibleUseCase
