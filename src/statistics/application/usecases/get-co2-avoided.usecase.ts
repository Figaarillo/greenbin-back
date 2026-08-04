import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import type Co2Avoided from '../../domain/types/co2-avoided.type'

class GetCo2AvoidedUseCase {
  constructor(private readonly repository: StatisticsRepository) {}

  async exec(entityId: string, from?: Date, to?: Date): Promise<Co2Avoided> {
    return await this.repository.getCo2Avoided(entityId, from, to)
  }
}

export default GetCo2AvoidedUseCase
