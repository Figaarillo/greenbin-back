import { ZodError, type ZodType } from 'zod'
import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerSchemaValidation from '../../domain/errors/reward-partner-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<RewardPartnerEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<RewardPartnerEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorRewardPartnerSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
