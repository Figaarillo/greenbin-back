import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class DeleteNeighborUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteNeighborUseCase
