import { ZodError, type ZodType } from 'zod'
import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointSchemaValidation from '../../domain/errors/green-point-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<GreenPointEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<GreenPointEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorGreenPointSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
