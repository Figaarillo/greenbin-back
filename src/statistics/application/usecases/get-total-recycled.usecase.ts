import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type TotalRecycled from '../../domain/types/total-recycled.type'

class GetTotalRecycledUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, from?: Date, to?: Date): Promise<TotalRecycled> {
    return await this.repository.getTotalRecycled(entityId, from, to)
  }
}

export default GetTotalRecycledUseCase
