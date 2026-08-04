import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type RewardPartnerRanking from '../../domain/types/reward-partner-ranking.type'

class GetRewardPartnersRankingUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, from?: Date, to?: Date, limit?: number): Promise<RewardPartnerRanking[]> {
    return await this.repository.getRewardPartnersRanking(entityId, from, to, limit)
  }
}

export default GetRewardPartnersRankingUseCase
