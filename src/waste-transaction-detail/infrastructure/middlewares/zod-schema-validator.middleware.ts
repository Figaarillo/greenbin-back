import { ZodError, type ZodType } from 'zod'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import type WasteTransactionDetailPayload from '../../domain/payloads/waste-transaction-detail.payload'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'

class WasteTransactionDetailSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<WasteTransactionDetailPayload>>
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

export default WasteTransactionDetailSchemaValidator
