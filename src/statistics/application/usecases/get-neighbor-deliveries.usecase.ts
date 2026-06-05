import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type NeighborDelivery from '../../domain/types/neighbor-delivery.type'

class GetNeighborDeliveriesUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(neighborId: string, from?: Date, to?: Date): Promise<NeighborDelivery[]> {
    return await this.repository.getNeighborDeliveries(neighborId, from, to)
  }
}

export default GetNeighborDeliveriesUseCase
