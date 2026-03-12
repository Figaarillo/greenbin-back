import { ZodError, type ZodType } from 'zod'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import type RewardPartnerPayload from '../../domain/payloads/reward-partner.payload'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import { formatZodErrorsToString, formatZodErrorsToObject } from '../../../shared/utils/hanlde-zod-error.util'

class RewardPartnerSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<RewardPartnerPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(
          'Validation errors occurred on reward partner payload',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors)
        )
      }

      throw error
    }
  }
}

export default RewardPartnerSchemaValidator
