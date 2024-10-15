import { RequestContext } from '@mikro-orm/core'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import GreenPointEntity from '../../../domain/entities/green-point.entity'
import type GreenPointUpdatePayload from '../../../domain/payloads/green-point.update.payload'
import type GreenPointRepository from '../../../domain/repositories/green-point.repository'

class GreenPointMikroORMRepository implements GreenPointRepository {
  async list(offset: number, limit: number): Promise<Nullable<GreenPointEntity[]>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No EntityManager found in RequestContext')
    }

    return await em.find(GreenPointEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<GreenPointEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No EntityManager found in RequestContext')
    }

    return await em.findOne(GreenPointEntity, property)
  }

  async save(newGreenPoint: GreenPointEntity): Promise<GreenPointEntity> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No EntityManager found in RequestContext')
    }

    await em.persist(newGreenPoint).flush()

    return newGreenPoint
  }

  async update(id: string, payload: GreenPointUpdatePayload): Promise<Nullable<GreenPointEntity>> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No EntityManager found in RequestContext')
    }

    const greenPoint = em.getReference(GreenPointEntity, id)
    if (greenPoint == null) return null

    greenPoint.update(payload)
    await em.flush()

    return greenPoint
  }

  async delete(id: string): Promise<void> {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new Error('No EntityManager found in RequestContext')
    }

    const greenPoint = em.getReference(GreenPointEntity, id)
    if (greenPoint == null) {
      throw new Error('Green point not found')
    }

    await em.remove(greenPoint).flush()
  }
}

export default GreenPointMikroORMRepository
