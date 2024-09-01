import type Nullable from '../../../shared/domain/types/nullable.type'
import type NeighborEntity from '../entities/neighbor.entity'
import type NeighborUpdatePayload from '../payloads/neighbor.update.payload'

interface NeighborRepository {
  list: (offset: number, limit: number) => Promise<Nullable<NeighborEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  save: (neighbor: NeighborEntity) => Promise<Nullable<NeighborEntity>>
  update: (id: string, payload: NeighborUpdatePayload) => Promise<Nullable<NeighborEntity>>
  delete: (id: string) => Promise<void>
}

export default NeighborRepository
