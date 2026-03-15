import { ZodError, type ZodType } from 'zod'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'
import type EntityEntity from '../../domain/entities/entity.entity'

class SchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<EntityEntity>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) handleZodError(error)

      throw error
    }
  }
}

export default SchemaValidator
