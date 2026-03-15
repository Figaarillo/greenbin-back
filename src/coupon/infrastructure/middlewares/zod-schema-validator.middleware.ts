import { ZodError, type ZodType } from 'zod'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'
import type CouponEntity from '../../domain/entities/coupon.entity'

class SchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<CouponEntity>
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

export default SchemaValidator
