import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleUpdatePayload from '../../domain/payloads/responsible.update.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class UpdateResponsibleUseCase {
  constructor(private readonly repository: ResponsibleRepository) {}

  async exec(id: string, payload: ResponsibleUpdatePayload): Promise<ResponsibleEntity> {
    const responsibleUpdated = await this.repository.update(id, payload)
    if (responsibleUpdated == null) {
      throw new ErrorResponsibleNotFound(id)
    }

    return responsibleUpdated
  }
}

export default UpdateResponsibleUseCase
