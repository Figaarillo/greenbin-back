import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteCategoryEntity from '../../../domain/entities/waste-category.entity'
import ErrorCategoryNotFound from '../../../domain/errors/category-not-found.error'
import type WasteCategoryPayload from '../../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../../domain/repositories/waste-category.repository'

class CategoryMikroORMRepository implements WasteCategoryRepository {
  async list(offset?: number, limit?: number, includeInactive?: boolean): Promise<Nullable<WasteCategoryEntity[]>> {
    const em = this.getEntityManager()

    const options: Record<string, any> = {}
    if (limit != null) options.limit = limit
    if (offset != null) options.offset = offset
    // El filtro global 'active' oculta inactivos por defecto. Solo cuando se piden
    // explícitamente (vista de admin) lo desactivamos para traerlos junto a los activos.
    if (includeInactive === true) options.filters = { active: false }

    return await em.find(WasteCategoryEntity, {}, options)
  }

  async find(property: Record<string, string>): Promise<Nullable<WasteCategoryEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(WasteCategoryEntity, property)
  }

  async save(newCategory: WasteCategoryEntity): Promise<Nullable<WasteCategoryEntity>> {
    const em = this.getEntityManager()
    await em.persist(newCategory).flush()
    return newCategory
  }

  async update(id: string, payload: WasteCategoryPayload): Promise<Nullable<WasteCategoryEntity>> {
    const em = this.getEntityManager()

    const category = await em.findOne(WasteCategoryEntity, { id })
    if (category == null) return null

    category.update(payload)
    await em.flush()

    return category
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const category = await em.findOne(WasteCategoryEntity, { id })
    if (category == null) {
      throw new ErrorCategoryNotFound(id)
    }

    category.softDelete()
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

export default CategoryMikroORMRepository
