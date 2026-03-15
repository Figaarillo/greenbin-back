import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class DeleteResponsibleUseCase {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteResponsibleUseCase
