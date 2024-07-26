import { ZodError, type ZodType } from 'zod'
import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorResponsibleSchemaValidation from '../../domain/errors/responsible-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<ResponsibleEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<ResponsibleEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorResponsibleSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
