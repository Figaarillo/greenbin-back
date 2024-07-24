import type Nullable from '@shared/domain/types/nullable.type'
import type EntityEntity from '../entities/entity.entity'
import type EntityPayload from '../payloads/entity.payload'

interface EntityRepository {
  list: (offset: number, limit: number) => Promise<Nullable<EntityEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<EntityEntity>>
  save: (entity: EntityEntity) => Promise<Nullable<EntityEntity>>
  update: (id: string, entity: EntityPayload) => Promise<Nullable<EntityEntity>>
  delete: (id: string) => Promise<void>
}

export default EntityRepository
