import type EntityEntity from '@entity/domain/entities/entity.entity'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'
import { type EntityManager } from '@mikro-orm/postgresql'
import type Nullable from '@shared/domain/types/nullable.type'
import { type Services } from 'src/db'

class EntityMikroORMRepository implements EntityRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  List!: (offset: number, limit: number) => Promise<Nullable<EntityEntity[]>>
  Find!: (property: Record<string, string>) => Promise<Nullable<EntityEntity>>
  Save!: (entity: EntityEntity) => Promise<Nullable<EntityEntity>>
  Update!: (id: string, entity: EntityPayload) => Promise<Nullable<EntityEntity>>
  Delete!: (id: string) => Promise<void>
}

export default EntityMikroORMRepository
