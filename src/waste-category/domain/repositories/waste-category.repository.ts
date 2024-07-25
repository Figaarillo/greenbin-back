import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteCategoryEntity from '../entities/waste-category.entity'

interface WasteCategoryRepository {
  list: (offset: number, limit: number) => Promise<Nullable<WasteCategoryEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteCategoryEntity>>
  save: (category: WasteCategoryEntity) => Promise<Nullable<WasteCategoryEntity>>
  update: (id: string, description: string) => Promise<Nullable<WasteCategoryEntity>>
  delete: (id: string) => Promise<void>
}

export default WasteCategoryRepository
