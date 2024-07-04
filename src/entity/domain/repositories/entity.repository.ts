import type Nullable from '@shared/domain/types/nullable.type'
import type EntityEntity from '../entities/entity.entity'
import type EntityPayload from '../payloads/entity.payload'

interface EntityRepository {
  List: (offset: number, limit: number) => Promise<Nullable<EntityEntity[]>>
  Find: (property: Record<string, string>) => Promise<Nullable<EntityEntity>>
  Save: (entity: EntityEntity) => Promise<Nullable<EntityEntity>>
  Update: (id: string, entity: EntityPayload) => Promise<Nullable<EntityEntity>>
  Delete: (id: string) => Promise<void>
}

export default EntityRepository
