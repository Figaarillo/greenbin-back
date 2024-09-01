import { ZodError, type ZodType } from 'zod'
import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborSchemaValidation from '../../domain/errors/neighbor-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<NeighborEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<NeighborEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorNeighborSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
