import { ZodError, type ZodType } from 'zod'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import { formatZodErrorsToObject, formatZodErrorsToString } from '../../../shared/utils/hanlde-zod-error.util'
import ErrorNeighborSchemaValidation from '../../domain/errors/neighbor-schema-validation.error'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'

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
        throw new ErrorNeighborSchemaValidation(
          'Validation errors occurred',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors),
          400
        )
      }
      throw error
    }
  }
}

export default SchemaValidator
