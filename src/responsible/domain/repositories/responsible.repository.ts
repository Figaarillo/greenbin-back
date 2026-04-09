import type Nullable from '../../../shared/domain/types/nullable.type'
import type ResponsibleEntity from '../entities/responsible.entity'
import type ResponsibleRelationships from '../enums/responsible-relationships.enum'
import type ResponsibleUpdatePayload from '../payloads/responsible.update.payload'

interface ResponsibleRepository {
  list: (offset: number, limit: number, entityId?: string) => Promise<Nullable<ResponsibleEntity[]>>
  find: (where: Record<string, string>, populate?: ResponsibleRelationships[]) => Promise<Nullable<ResponsibleEntity>>
  save: (responsible: ResponsibleEntity) => Promise<Nullable<ResponsibleEntity>>
  update: (id: string, payload: ResponsibleUpdatePayload) => Promise<Nullable<ResponsibleEntity>>
  delete: (id: string) => Promise<void>
}

export default ResponsibleRepository
