import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class ListResponsiblesUseCase {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async exec(offset: number, limit: number): Promise<ResponsibleEntity[]> {
    const responsiblesFounded = await this.repository.list(offset, limit)
    if (responsiblesFounded == null) {
      throw new ErrorResponsibleNotFound('Cannot find any responsible when try to list all responsibles')
    }

    if (responsiblesFounded.length === 0) {
      throw new ErrorResponsibleNotFound('Cannot find any responsible when try to list all responsibles')
    }

    return responsiblesFounded
  }
}

export default ListResponsiblesUseCase
