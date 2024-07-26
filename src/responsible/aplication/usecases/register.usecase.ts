import ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorCannotSaveResponsible from '../../domain/errors/cannot-save-responsible.error'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class RegisterResponsibleUseCase {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async exec(payload: ResponsiblePayload): Promise<ResponsibleEntity> {
    const newResponsible = new ResponsibleEntity(payload)

    const responsible = await this.repository.save(newResponsible)
    if (responsible == null) {
      throw new ErrorCannotSaveResponsible('Cannot save new responsible')
    }

    return responsible
  }
}

export default RegisterResponsibleUseCase
