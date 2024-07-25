import { type EntityManager } from '@mikro-orm/core'
import { type Services } from '../../../../db'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteCategoryEntity from '../../../domain/entities/waste-category.entity'
import type WasteCategoryRepository from '../../../domain/repositories/waste-category.repository'

class CategoryMikroORMRepository implements WasteCategoryRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  async list(offset: number, limit: number): Promise<Nullable<WasteCategoryEntity[]>> {
    return await this.em.find(WasteCategoryEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<WasteCategoryEntity>> {
    return await this.em.findOne(WasteCategoryEntity, property)
  }

  async save(category: WasteCategoryEntity): Promise<Nullable<WasteCategoryEntity>> {
    const newCategory = this.em.create(WasteCategoryEntity, category)
    await this.em.persist(newCategory).flush()

    return newCategory
  }

  async update(id: string, description: string): Promise<Nullable<WasteCategoryEntity>> {
    const category = this.em.getReference(WasteCategoryEntity, id)
    if (category == null) return null

    category.update(description)
    await this.em.flush()

    return category
  }

  async delete(id: string): Promise<void> {
    const category = this.em.getReference(WasteCategoryEntity, id)
    if (category == null) throw new Error('Error when try to delete waste category. Waste category not found')

    await this.em.remove(category).flush()
  }
}

export default CategoryMikroORMRepository
