import type Nullable from '../../../shared/domain/types/nullable.type'
import type GreenPointEntity from '../entities/green-point.entity'
import type GreenPointUpdatePayload from '../payloads/green-point.update.payload'

interface GreenPointRepository {
  list: (offset: number, limit: number) => Promise<Nullable<GreenPointEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<GreenPointEntity>>
  save: (greenPoint: GreenPointEntity) => Promise<Nullable<GreenPointEntity>>
  update: (id: string, payload: GreenPointUpdatePayload) => Promise<Nullable<GreenPointEntity>>
  delete: (id: string) => Promise<void>
}

export default GreenPointRepository
