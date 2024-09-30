import { type EntityManager } from '@mikro-orm/postgresql'
import { type Services } from '../../../../db'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import NeighborEntity from '../../../domain/entities/neighbor.entity'
import type NeighborUpdatePayload from '../../../domain/payloads/neighbor.update.payload'
import type NeighborRepository from '../../../domain/repositories/neighbor.repository'

class NeighborMikroORMRepository implements NeighborRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  async list(offset: number, limit: number): Promise<Nullable<NeighborEntity[]>> {
    return await this.em.find(NeighborEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<NeighborEntity>> {
    return await this.em.findOne(NeighborEntity, property)
  }

  async findWithPassword(property: Partial<NeighborEntity>): Promise<NeighborEntity | null> {
    return await this.em.findOne(NeighborEntity, property, { populate: ['password'] })
  }

  async save(neighbor: NeighborEntity): Promise<Nullable<NeighborEntity>> {
    const newNeighbor = this.em.create(NeighborEntity, neighbor)
    await this.em.persist(newNeighbor).flush()

    return newNeighbor
  }

  async update(id: string, payload: NeighborUpdatePayload): Promise<Nullable<NeighborEntity>> {
    const neighbor = this.em.getReference(NeighborEntity, id)
    if (neighbor == null) return null

    neighbor.update(payload)
    await this.em.flush()

    return neighbor
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export default NeighborMikroORMRepository
