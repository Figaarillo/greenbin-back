import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class FindByEmailUseCase {
  constructor(private readonly repository: ResponsibleRepository) {}

  async exec(email: string): Promise<ResponsibleEntity> {
    const responsible = await this.repository.find({ email })
    if (responsible == null) throw new ErrorResponsibleNotFound(undefined, undefined, email)
    return responsible
  }
}

export default FindByEmailUseCase
