import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class FindResponsibleByIDUseCase {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<ResponsibleEntity> {
    const responsibleFound = await this.repository.find({ id })
    if (responsibleFound == null) {
      throw new ErrorResponsibleNotFound(`Cannont find responsible with id: ${id} when get responsible by id`)
    }

    return responsibleFound
  }
}

export default FindResponsibleByIDUseCase
