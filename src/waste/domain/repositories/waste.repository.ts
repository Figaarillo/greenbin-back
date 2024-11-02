import type Nullable from '../../../shared/domain/types/nullable.type'
import type WasteEntity from '../entities/waste.entity'

interface WasteRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<WasteEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<WasteEntity>>
  save: (waste: WasteEntity) => Promise<Nullable<WasteEntity>>
}

export default WasteRepository
