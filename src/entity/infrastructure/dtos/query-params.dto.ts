import { z } from 'zod'
import { EntityRelationships } from '../../domain/enums/entity.enum'

const EntityQueryParams = z.object({
  id: z.string().uuid(),
  with: z.preprocess(value => (typeof value === 'string' ? [value] : value), z.array(z.nativeEnum(EntityRelationships)))
})

export default EntityQueryParams
