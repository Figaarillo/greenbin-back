import type Nullable from '../../../shared/domain/types/nullable.type'
import type EntityEntity from '../entities/entity.entity'
import { type EntityRelationships } from '../enums/entity.enum'

interface EntityRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<EntityEntity[]>>
  find: (where: Record<string, any>, populate?: EntityRelationships[]) => Promise<Nullable<EntityEntity>>
  save: (entity: EntityEntity) => Promise<Nullable<EntityEntity>>
  update: (id: string, description: string) => Promise<Nullable<EntityEntity>>
  changePassword: (email: string, newPassword: string) => Promise<boolean>
  delete: (id: string) => Promise<void>
}

export default EntityRepository
