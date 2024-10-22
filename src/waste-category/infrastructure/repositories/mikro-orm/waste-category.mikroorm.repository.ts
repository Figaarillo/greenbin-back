import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteCategoryEntity from '../../../domain/entities/waste-category.entity'
import type WasteCategoryPayload from '../../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../../domain/repositories/waste-category.repository'

class CategoryMikroORMRepository implements WasteCategoryRepository {
  async list(offset: number, limit: number): Promise<Nullable<WasteCategoryEntity[]>> {
    const em = this.getEntityManager()
    return await em.find(WasteCategoryEntity, {}, { limit, offset })
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

    const category = em.getReference(WasteCategoryEntity, id)
    if (category == null) return null

    category.update(payload)
    await em.flush()

    return category
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const category = em.getReference(WasteCategoryEntity, id)
    if (category == null) {
      throw new Error('Error when try to delete waste category. Waste category not found')
    }

    await em.remove(category).flush()
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
