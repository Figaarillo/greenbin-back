import type TotalRecycled from '../types/total-recycled.type'
import type GreenPointRanking from '../types/green-point-ranking.type'
import type WasteByCategory from '../types/waste-by-category.type'
import type WasteByPeriod from '../types/waste-by-period.type'
import type NeighborDelivery from '../types/neighbor-delivery.type'

interface StatisticsRepository {
  getTotalRecycled: (entityId: string, from?: Date, to?: Date) => Promise<TotalRecycled>
  getGreenPointsRanking: (entityId: string, from?: Date, to?: Date) => Promise<GreenPointRanking[]>
  getWasteByCategory: (entityId: string, from?: Date, to?: Date) => Promise<WasteByCategory[]>
  getWasteByPeriod: (entityId: string, groupBy: string, from?: Date, to?: Date) => Promise<WasteByPeriod[]>
  getNeighborDeliveries: (neighborId: string, from?: Date, to?: Date) => Promise<NeighborDelivery[]>
}

export default StatisticsRepository
