import { type EntityManager } from '@mikro-orm/postgresql'
import { type Services } from '../../../../db'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import EntityEntity from '../../../domain/entities/entity.entity'
import type EntityRepository from '../../../domain/repositories/entity.repository'

class EntityMikroORMRepository implements EntityRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  async list(offset: number, limit: number): Promise<Nullable<EntityEntity[]>> {
    return await this.em.find(EntityEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    return await this.em.findOne(EntityEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    return await this.em.findOne(EntityEntity, property, { populate: ['password'] })
  }

  async save(entity: EntityEntity): Promise<Nullable<EntityEntity>> {
    const newEntity = this.em.create(EntityEntity, entity)
    await this.em.persist(newEntity).flush()

    return newEntity
  }

  async update(id: string, description: string): Promise<Nullable<EntityEntity>> {
    const entity = this.em.getReference(EntityEntity, id)
    if (entity == null) return null

    entity.update(description)
    await this.em.flush()

    return entity
  }

  async delete(id: string): Promise<void> {
    const entity = this.em.getReference(EntityEntity, id)
    if (entity == null) throw new Error('Entity not found')

    await this.em.remove(entity).flush()
  }
}

export default EntityMikroORMRepository
