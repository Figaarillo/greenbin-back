import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type PointsBalance from '../../domain/types/points-balance.type'

class GetPointsBalanceUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string): Promise<PointsBalance> {
    return await this.repository.getPointsBalance(entityId)
  }
}

export default GetPointsBalanceUseCase
