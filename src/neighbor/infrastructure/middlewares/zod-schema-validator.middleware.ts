import { ZodError, type ZodType } from 'zod'
import { formatZodErrors } from '../../../shared/utils/hanlde-zod-error.util'
import ErrorNeighborSchemaValidation from '../../domain/errors/neighbor-schema-validation.error'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'

class SchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<NeighborPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        const detailedErrors = formatZodErrors(error.errors)
        throw new ErrorNeighborSchemaValidation(
          JSON.stringify({
            message: 'Validation errors occurred',
            errors: detailedErrors
          })
        )
      }
      throw error
    }
  }
}

export default SchemaValidator
