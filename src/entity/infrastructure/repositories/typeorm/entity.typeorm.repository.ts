import EntityEntity from '@entity/domain/entities/entity.entity'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'
import type Nullable from '@shared/domain/types/nullable.type'
import { type DataSource, type Repository } from 'typeorm'

class EntityTypeormRepository implements EntityRepository {
  private readonly repository: Repository<EntityEntity>

  constructor(private readonly db: DataSource) {
    this.repository = this.initRepository()
  }

  List!: (offset: number, limit: number) => Promise<Nullable<EntityEntity[]>>
  Find!: (property: Record<string, string>) => Promise<Nullable<EntityEntity>>

  async Save(Entity: EntityEntity): Promise<Nullable<EntityEntity>> {
    const repository = this.repository

    return await repository.save(Entity)
  }

  Update!: (id: string, entity: EntityPayload) => Promise<Nullable<EntityEntity>>
  Delete!: (id: string) => Promise<void>

  private initRepository(): Repository<EntityEntity> {
    const getConnect = this.db

    return getConnect.getRepository(EntityEntity)
  }
}

export default EntityTypeormRepository
