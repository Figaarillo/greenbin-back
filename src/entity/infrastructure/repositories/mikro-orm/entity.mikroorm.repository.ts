import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import EntityEntity from '../../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../../domain/repositories/entity.repository'

class EntityMikroORMRepository implements EntityRepository {
  async list(offset: number, limit: number): Promise<Nullable<EntityEntity[]>> {
    const em = this.getEntityManager()
    return await em.find(EntityEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(EntityEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(EntityEntity, property, { populate: ['password'] })
  }

  async save(entity: EntityEntity): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()

    await em.persist(entity).flush()

    return entity
  }

  async update(id: string, description: string): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()

    const entity = em.getReference(EntityEntity, id)
    if (entity == null) return null

    entity.update(description)
    await em.flush()

    return entity
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const entity = em.getReference(EntityEntity, id)
    if (entity == null) {
      throw new ErrorEntityNotFound(id, undefined, undefined)
    }

    await em.remove(entity).flush()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getEntityManager() {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }

    return em
  }
}

export default EntityMikroORMRepository
