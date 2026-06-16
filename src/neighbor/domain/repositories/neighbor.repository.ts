import type Nullable from '../../../shared/domain/types/nullable.type'
import type NeighborEntity from '../entities/neighbor.entity'
import type NeighborUpdatePayload from '../payloads/neighbor.update.payload'

interface NeighborRepository {
  list: (
    offset: number,
    limit: number,
    entityId?: string,
    includeInactive?: boolean
  ) => Promise<Nullable<NeighborEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  findWithWaste: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  findWithPassword: (property: Record<string, string>) => Promise<Nullable<NeighborEntity>>
  save: (neighbor: NeighborEntity) => Promise<Nullable<NeighborEntity>>
  update: (id: string, payload: NeighborUpdatePayload) => Promise<Nullable<NeighborEntity>>
  changePassword: (email: string, newPassword: string) => Promise<boolean>
  delete: (id: string) => Promise<void>
}

export default NeighborRepository
