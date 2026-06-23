import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import NeighborEntity from '../../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../../domain/errors/neighbor-not-found.error'
import type NeighborUpdatePayload from '../../../domain/payloads/neighbor.update.payload'
import type NeighborRepository from '../../../domain/repositories/neighbor.repository'

class NeighborMikroORMRepository implements NeighborRepository {
  async find(property: Record<string, any>): Promise<Nullable<NeighborEntity>> {
    // FIX: acepta any para permitir buscar por number (dni) además de string
    const em = this.getEntityManager()
    return await em.findOne(NeighborEntity, property)
  }

  async findWithWaste(property: Record<string, string>): Promise<Nullable<NeighborEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(NeighborEntity, property, { populate: ['wastes'] })
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

    // FIX: usar findOne en lugar de getReference para asegurar que la entidad existe
    const neighbor = await em.findOne(NeighborEntity, { id })
    if (neighbor == null) return null

    neighbor.update(payload)
    await em.flush() // ya estaba, pero ahora sobre entidad real (no referencia)

    return neighbor
  }

  async list(
    offset: number,
    limit: number,
    entityId?: string,
    includeInactive?: boolean
  ): Promise<Nullable<NeighborEntity[]>> {
    const em = this.getEntityManager()
    const where: Record<string, any> = {}
    if (entityId != null) where.entity = { id: entityId }
    // El filtro global 'active' oculta inactivos por defecto. Solo cuando se piden
    // explícitamente (vista de admin) lo desactivamos para traerlos junto a los activos.
    return await em.find(NeighborEntity, where, {
      limit,
      offset,
      orderBy: { createdAt: 'ASC' },
      ...(includeInactive === true ? { filters: { active: false } } : {})
    })
  }

  async changePassword(email: string, newPassword: string): Promise<boolean> {
    const em = this.getEntityManager()
    const neighbor = await em.findOne(NeighborEntity, { email })
    if (neighbor == null) return false
    neighbor.password = newPassword
    await em.flush()
    return true
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const neighbor = await em.findOne(NeighborEntity, { id })
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(id, undefined, undefined)
    }

    neighbor.softDelete()
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

export default NeighborMikroORMRepository
