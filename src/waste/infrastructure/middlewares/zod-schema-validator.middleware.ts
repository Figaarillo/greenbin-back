import { ZodError, type ZodType } from 'zod'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'
import type WastePayload from '../../domain/payloads/waste.payload'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'

class WasteSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<WastePayload>>
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

export default WasteSchemaValidator
