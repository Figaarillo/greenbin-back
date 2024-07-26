import type Nullable from '../../../shared/domain/types/nullable.type'
import type ResponsibleResponsible from '../entities/responsible.entity'
import type ResponsibleUpdatePayload from '../payloads/responsible.update.payload'

interface ResponsibleRepository {
  list: (offset: number, limit: number) => Promise<Nullable<ResponsibleResponsible[]>>
  find: (property: Record<string, string>) => Promise<Nullable<ResponsibleResponsible>>
  save: (responsible: ResponsibleResponsible) => Promise<Nullable<ResponsibleResponsible>>
  update: (id: string, payload: ResponsibleUpdatePayload) => Promise<Nullable<ResponsibleResponsible>>
  delete: (id: string) => Promise<void>
}

export default ResponsibleRepository
