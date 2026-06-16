import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteEntity from '../../../domain/entities/waste.entity'
import type WasteRepository from '../../../domain/repositories/waste.repository'
import WasteCategoryEntity from '../../../../waste-category/domain/entities/waste-category.entity'

class WasteMikroORMRepository implements WasteRepository {
  list!: (offset?: number | undefined, limit?: number | undefined) => Promise<Nullable<WasteEntity[]>>

  async find(property: Record<string, string>): Promise<Nullable<WasteEntity>> {
    const em = this.getEntityManager()
    // Desactivamos el filtro 'active' para que la categoría se popule aunque esté
    // dada de baja (un waste registrado bajo una categoría luego desactivada).
    return await em.findOne(WasteEntity, property, { populate: ['category'], filters: { active: false } })
  }

  async findCategory(property: Record<string, string>): Promise<Nullable<WasteCategoryEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(WasteCategoryEntity, property)
  }

  async save(waste: WasteEntity): Promise<Nullable<WasteEntity>> {
    const em = this.getEntityManager()

    await em.persist(waste).flush()
    return waste
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

export default WasteMikroORMRepository
