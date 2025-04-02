import { ZodError, type ZodType } from 'zod'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import { formatZodErrorsToObject, formatZodErrorsToString } from '../../../shared/utils/hanlde-zod-error.util'
import type GreenPointPayload from '../../domain/payloads/green-point.payload'

class GreenPointSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<GreenPointPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(
          'Validation errors occurred on green point payload',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors)
        )
      }

      throw error
    }
  }
}

export default GreenPointSchemaValidator
