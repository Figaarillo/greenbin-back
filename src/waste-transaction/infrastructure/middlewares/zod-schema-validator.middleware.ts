import { ZodError, type ZodType } from 'zod'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import { formatZodErrorsToObject, formatZodErrorsToString } from '../../../shared/utils/hanlde-zod-error.util'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'

class WasteTransactionSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<WasteTransactionPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(
          'Validation errors occurred on waste transaction payload',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors)
        )
      }

      throw error
    }
  }
}

export default WasteTransactionSchemaValidator
