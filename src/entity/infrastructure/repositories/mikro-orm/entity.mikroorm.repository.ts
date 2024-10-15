import { RequestContext } from '@mikro-orm/core'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import EntityEntity from '../../../domain/entities/entity.entity'
import type EntityRepository from '../../../domain/repositories/entity.repository'

class EntityMikroORMRepository implements EntityRepository {
  async list(offset: number, limit: number): Promise<Nullable<EntityEntity[]>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    return await em.find(EntityEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    return await em.findOne(EntityEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    return await em.findOne(EntityEntity, property, { populate: ['password'] })
  }

  async save(entity: EntityEntity): Promise<Nullable<EntityEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    await em.persist(entity).flush()

    return entity
  }

  async update(id: string, description: string): Promise<Nullable<EntityEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    const entity = em.getReference(EntityEntity, id)
    if (entity == null) return null

    entity.update(description)
    await em.flush()

    return entity
  }

  async delete(id: string): Promise<void> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No `EntityManager` found in RequestContext')
    }

    const entity = em.getReference(EntityEntity, id)
    if (entity == null) {
      throw new Error('Entity not found')
    }

    await em.remove(entity).flush()
  }
}

export default EntityMikroORMRepository
