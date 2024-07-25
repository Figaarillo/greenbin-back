import { ZodError, type ZodType } from 'zod'
import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntitySchemaValidation from '../../domain/errors/entity-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<EntityEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<EntityEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorEntitySchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
