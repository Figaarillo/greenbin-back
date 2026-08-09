import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type NeighborRanking from '../../domain/types/neighbor-ranking.type'

class GetNeighborRankingByGreenPointUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(greenPointId: string, from?: Date, to?: Date): Promise<NeighborRanking[]> {
    return await this.repository.getNeighborRankingByGreenPoint(greenPointId, from, to)
  }
}

export default GetNeighborRankingByGreenPointUseCase
