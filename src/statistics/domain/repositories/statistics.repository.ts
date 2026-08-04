import type TotalRecycled from '../types/total-recycled.type'
import type GreenPointRanking from '../types/green-point-ranking.type'
import type WasteByCategory from '../types/waste-by-category.type'
import type WasteByPeriod from '../types/waste-by-period.type'
import type NeighborDelivery from '../types/neighbor-delivery.type'
import type NeighborRanking from '../types/neighbor-ranking.type'
import type EntityCounts from '../types/entity-counts.type'
import type RewardPartnerRanking from '../types/reward-partner-ranking.type'
import type Co2Avoided from '../types/co2-avoided.type'
import type PointsBalance from '../types/points-balance.type'

interface StatisticsRepository {
  getTotalRecycled: (entityId: string, from?: Date, to?: Date) => Promise<TotalRecycled>
  getCo2Avoided: (entityId: string, from?: Date, to?: Date) => Promise<Co2Avoided>
  getPointsBalance: (entityId: string) => Promise<PointsBalance>
  getEntityCounts: (entityId: string) => Promise<EntityCounts>
  getRewardPartnersRanking: (
    entityId: string,
    from?: Date,
    to?: Date,
    limit?: number
  ) => Promise<RewardPartnerRanking[]>
  getGreenPointsRanking: (entityId: string, from?: Date, to?: Date, limit?: number) => Promise<GreenPointRanking[]>
  getWasteByCategory: (entityId: string, from?: Date, to?: Date) => Promise<WasteByCategory[]>
  getWasteByPeriod: (entityId: string, groupBy: string, from?: Date, to?: Date) => Promise<WasteByPeriod[]>
  getNeighborDeliveries: (neighborId: string, from?: Date, to?: Date) => Promise<NeighborDelivery[]>
  getNeighborRankingByGreenPoint: (greenPointId: string, from?: Date, to?: Date) => Promise<NeighborRanking[]>
}

export default StatisticsRepository
