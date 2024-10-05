import { type EntityManager } from '@mikro-orm/postgresql'
import { type Services } from '../../../../db'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import ResponsibleEntity from '../../../domain/entities/responsible.entity'
import type ResponsibleUpdatePayload from '../../../domain/payloads/responsible.update.payload'
import type ResponsibleRepository from '../../../domain/repositories/responsible.repository'

class ResponsibleMikroORMRepository implements ResponsibleRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  async list(offset: number, limit: number): Promise<Nullable<ResponsibleEntity[]>> {
    return await this.em.find(ResponsibleEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<ResponsibleEntity>> {
    return await this.em.findOne(ResponsibleEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<ResponsibleEntity>> {
    return await this.em.findOne(ResponsibleEntity, property, { populate: ['password'] })
  }

  async save(responsible: ResponsibleEntity): Promise<Nullable<ResponsibleEntity>> {
    const newResponsible = this.em.create(ResponsibleEntity, responsible)
    await this.em.persist(newResponsible).flush()

    return newResponsible
  }

  async update(id: string, payload: ResponsibleUpdatePayload): Promise<Nullable<ResponsibleEntity>> {
    const responsible = this.em.getReference(ResponsibleEntity, id)
    if (responsible == null) return null

    responsible.update(payload)
    await this.em.flush()

    return responsible
  }

  async delete(id: string): Promise<void> {
    const responsible = this.em.getReference(ResponsibleEntity, id)
    if (responsible == null) throw new Error('Responsible not found')

    await this.em.remove(responsible).flush()
  }
}

export default ResponsibleMikroORMRepository
