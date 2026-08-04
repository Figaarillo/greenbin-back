import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type EntityCounts from '../../domain/types/entity-counts.type'

class GetEntityCountsUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string): Promise<EntityCounts> {
    return await this.repository.getEntityCounts(entityId)
  }
}

export default GetEntityCountsUseCase
