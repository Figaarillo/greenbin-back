import { ZodError, type ZodType } from 'zod'
import ErrorWasteSchemaValidation from '../../domain/errors/waste-schema-validation.error'
import type WastePayload from '../../domain/payloads/waste.payload'

interface Payload extends WastePayload {
  id: string
}

class SchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<Payload>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorWasteSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
