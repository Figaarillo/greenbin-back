import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import GreenPointEntity from '../../../domain/entities/green-point.entity'
import ErrorGreenPointNotFound from '../../../domain/errors/green-point-not-found.error'
import type GreenPointUpdatePayload from '../../../domain/payloads/green-point.update.payload'
import type GreenPointRepository from '../../../domain/repositories/green-point.repository'

class GreenPointMikroORMRepository implements GreenPointRepository {
  async list(
    offset: number,
    limit: number,
    entityId?: string,
    includeInactive?: boolean
  ): Promise<Nullable<GreenPointEntity[]>> {
    const em = this.getEntityManager()
    const where: Record<string, any> = {}
    if (entityId != null) where.entity = { id: entityId }
    // El filtro global 'active' oculta inactivos por defecto. Solo cuando se piden
    // explícitamente (vista de admin) lo desactivamos para traerlos junto a los activos.
    return await em.find(GreenPointEntity, where, {
      limit,
      offset,
      ...(includeInactive === true ? { filters: { active: false } } : {})
    })
  }

  async find(property: Record<string, string>): Promise<Nullable<GreenPointEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(GreenPointEntity, property)
  }

  async save(newGreenPoint: GreenPointEntity): Promise<GreenPointEntity> {
    const em = this.getEntityManager()

    await em.persist(newGreenPoint).flush()

    return newGreenPoint
  }

  async update(id: string, payload: GreenPointUpdatePayload): Promise<Nullable<GreenPointEntity>> {
    const em = this.getEntityManager()

    const greenPoint = await em.findOne(GreenPointEntity, { id })
    if (greenPoint == null) return null

    greenPoint.update(payload)
    await em.flush()

    return greenPoint
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const greenPoint = await em.findOne(GreenPointEntity, { id })
    if (greenPoint == null) {
      throw new ErrorGreenPointNotFound(id, undefined)
    }

    greenPoint.softDelete()
    await em.flush()
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

export default GreenPointMikroORMRepository
