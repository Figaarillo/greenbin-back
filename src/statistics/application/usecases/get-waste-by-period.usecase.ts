import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type WasteByPeriod from '../../domain/types/waste-by-period.type'

class GetWasteByPeriodUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, groupBy: string, from?: Date, to?: Date): Promise<WasteByPeriod[]> {
    return await this.repository.getWasteByPeriod(entityId, groupBy, from, to)
  }
}

export default GetWasteByPeriodUseCase
