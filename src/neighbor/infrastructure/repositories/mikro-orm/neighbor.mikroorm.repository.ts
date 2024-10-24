import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import NeighborEntity from '../../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../../domain/errors/neighbor-not-found.error'
import type NeighborUpdatePayload from '../../../domain/payloads/neighbor.update.payload'
import type NeighborRepository from '../../../domain/repositories/neighbor.repository'

class NeighborMikroORMRepository implements NeighborRepository {
  async list(offset: number, limit: number): Promise<Nullable<NeighborEntity[]>> {
    const em = this.getEntityManager()
    return await em.find(NeighborEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<NeighborEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(NeighborEntity, property)
  }

  async findWithPassword(property: Partial<NeighborEntity>): Promise<NeighborEntity | null> {
    const em = this.getEntityManager()
    return await em.findOne(NeighborEntity, property, { populate: ['password'] })
  }

  async save(newNeighbor: NeighborEntity): Promise<Nullable<NeighborEntity>> {
    const em = this.getEntityManager()
    await em.persist(newNeighbor).flush()
    return newNeighbor
  }

  async update(id: string, payload: NeighborUpdatePayload): Promise<Nullable<NeighborEntity>> {
    const em = this.getEntityManager()

    const neighbor = em.getReference(NeighborEntity, id)
    if (neighbor == null) return null

    neighbor.update(payload)
    await em.flush()

    return neighbor
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const neighbor = em.getReference(NeighborEntity, id)
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(id, undefined, undefined)
    }

    await em.remove(neighbor).flush()
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

export default NeighborMikroORMRepository
