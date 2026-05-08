import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type WasteByCategory from '../../domain/types/waste-by-category.type'

class GetWasteByCategoryUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, from?: Date, to?: Date): Promise<WasteByCategory[]> {
    return await this.repository.getWasteByCategory(entityId, from, to)
  }
}

export default GetWasteByCategoryUseCase
