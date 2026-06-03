import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import EntityEntity from '../../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../../domain/repositories/entity.repository'
import { type EntityUpdatePayload } from '../../../domain/repositories/entity.repository'
import { type EntityRelationships } from '../../../domain/enums/entity.enum'

class EntityMikroORMRepository implements EntityRepository {
  async list(offset?: number, limit?: number): Promise<Nullable<EntityEntity[]>> {
    const em = this.getEntityManager()

    if (limit == null) return await em.find(EntityEntity, {})
    if (offset == null) return await em.find(EntityEntity, {}, { limit })

    return await em.find(EntityEntity, {}, { limit, offset })
  }

  async find(where: Record<string, any>, populate?: EntityRelationships[]): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(EntityEntity, where, { populate })
  }

  async save(entity: EntityEntity): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()
    await em.persist(entity).flush()
    return entity
  }

  async update(id: string, payload: EntityUpdatePayload): Promise<Nullable<EntityEntity>> {
    const em = this.getEntityManager()

    const entity = await em.findOne(EntityEntity, { id })
    if (entity == null) return null

    entity.update(payload)
    await em.flush()

    return entity
  }

  async changePassword(email: string, newPassword: string): Promise<boolean> {
    const em = this.getEntityManager()
    const entity = await em.findOne(EntityEntity, { email })
    if (entity == null) return false
    entity.password = newPassword
    await em.flush()
    return true
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const entity = await em.findOne(EntityEntity, { id })
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
