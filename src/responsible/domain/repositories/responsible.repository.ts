import type Nullable from '../../../shared/domain/types/nullable.type'
import type ResponsibleEntity from '../entities/responsible.entity'
import type ResponsibleUpdatePayload from '../payloads/responsible.update.payload'

interface ResponsibleRepository {
  list: (offset: number, limit: number) => Promise<Nullable<ResponsibleEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<ResponsibleEntity>>
  save: (responsible: ResponsibleEntity) => Promise<Nullable<ResponsibleEntity>>
  update: (id: string, payload: ResponsibleUpdatePayload) => Promise<Nullable<ResponsibleEntity>>
  delete: (id: string) => Promise<void>
}

export default ResponsibleRepository
