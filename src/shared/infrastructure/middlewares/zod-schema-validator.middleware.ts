import { ZodError, type ZodType } from 'zod'
import ErrorSchemaValidation from '../../domain/errors/schema-validation.error'

class SchemaValidator<TDTOSchema, TPayload> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<TPayload>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
