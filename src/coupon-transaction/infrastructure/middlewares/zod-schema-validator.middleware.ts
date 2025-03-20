import { ZodError, type ZodType } from 'zod'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import type ExtendPayload from '../../../shared/domain/types/ext-payload.type'
import { formatZodErrorsToObject, formatZodErrorsToString } from '../../../shared/utils/hanlde-zod-error.util'
import type CouponTransactionPayload from '../../domain/payloads/coupon-transaction.payload'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'

class CouponTransactionSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<ExtendPayload<CouponTransactionPayload | RedeemCouponPayload>>
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(
          'Validation error on coupon transaction payload',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors),
          400
        )
      }

      throw error
    }
  }
}

export default CouponTransactionSchemaValidator
