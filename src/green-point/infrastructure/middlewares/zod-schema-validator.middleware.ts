import { ZodError, type ZodIssue, type ZodType } from 'zod'
import type GreenPointEntity from '../../domain/entities/green-point.entity'
import ErrorGreenPointSchemaValidation from '../../domain/errors/green-point-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<GreenPointEntity>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        const detailedErrors = this.formatZodErrors(error.errors)
        throw new ErrorGreenPointSchemaValidation(
          JSON.stringify({
            message: 'Validation errors occurred',
            errors: detailedErrors
          })
        )
      }
      throw error
    }
  }

  private formatZodErrors(errors: ZodIssue[]): Array<{ field: string; error: string }> {
    return errors.map(err => ({
      field: err.path.join('.'),
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      error: err.message || 'Invalid value'
    }))
  }
}

export default SchemaValidator
