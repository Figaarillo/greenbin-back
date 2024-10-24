import { RequestContext } from '@mikro-orm/core'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import ResponsibleEntity from '../../../domain/entities/responsible.entity'
import type ResponsibleUpdatePayload from '../../../domain/payloads/responsible.update.payload'
import type ResponsibleRepository from '../../../domain/repositories/responsible.repository'
import ErrorResponsibleNotFound from '../../../domain/errors/responsible-not-found.error'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'

class ResponsibleMikroORMRepository implements ResponsibleRepository {
  async list(offset: number, limit: number): Promise<Nullable<ResponsibleEntity[]>> {
    const em = this.getEntityManager()
    return await em.find(ResponsibleEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<ResponsibleEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(ResponsibleEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<ResponsibleEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(ResponsibleEntity, property, { populate: ['password'] })
  }

  async save(newResponsible: ResponsibleEntity): Promise<Nullable<ResponsibleEntity>> {
    const em = this.getEntityManager()
    await em.persist(newResponsible).flush()
    return newResponsible
  }

  async update(id: string, payload: ResponsibleUpdatePayload): Promise<Nullable<ResponsibleEntity>> {
    const em = this.getEntityManager()

    const responsible = em.getReference(ResponsibleEntity, id)
    if (responsible == null) return null

    responsible.update(payload)
    await em.flush()

    return responsible
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const responsible = em.getReference(ResponsibleEntity, id)
    if (responsible == null) {
      throw new ErrorResponsibleNotFound(id, undefined, undefined)
    }

    await em.remove(responsible).flush()
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

export default ResponsibleMikroORMRepository
