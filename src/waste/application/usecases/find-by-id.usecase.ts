import type WasteEntity from '../../domain/entities/waste.entity'
import ErrorWasteNotFound from '../../domain/errors/waste-not-found.error'
import type WasteRepository from '../../domain/repositories/waste.repository'

class FindWasteByIDUseCase {
  constructor(private readonly repository: WasteRepository) {}

  async exec(id: string): Promise<WasteEntity> {
    const waste = await this.repository.find({ id })
    if (waste == null) {
      throw new ErrorWasteNotFound(id)
    }

    return waste
  }
}

export default FindWasteByIDUseCase
