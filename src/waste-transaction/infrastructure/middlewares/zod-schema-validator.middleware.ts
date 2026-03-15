import { ZodError, type ZodType } from 'zod'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'

class WasteTransactionSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<WasteTransactionPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) handleZodError(error)

      throw error
    }
  }
}

export default WasteTransactionSchemaValidator
