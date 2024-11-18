import type GreenPointRepository from '../../domain/repositories/green-point.repository'

class DeleteGreenPointUseCase {
  constructor(private readonly repository: GreenPointRepository) {}

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteGreenPointUseCase
