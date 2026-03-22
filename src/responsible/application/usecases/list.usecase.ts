import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class ListResponsiblesUseCase {
  constructor(private readonly repository: ResponsibleRepository) {}

  async exec(offset: number, limit: number): Promise<ResponsibleEntity[]> {
    const responsiblesFounded = await this.repository.list(offset, limit)
    if (responsiblesFounded == null) {
      throw new ErrorResponsibleNotFound()
    }

    return responsiblesFounded
  }
}

export default ListResponsiblesUseCase
