import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type GreenPointRanking from '../../domain/types/green-point-ranking.type'

class GetGreenPointsRankingUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, from?: Date, to?: Date, limit?: number): Promise<GreenPointRanking[]> {
    return await this.repository.getGreenPointsRanking(entityId, from, to, limit)
  }
}

export default GetGreenPointsRankingUseCase
