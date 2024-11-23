import { ZodError, type ZodType } from 'zod'
import throwZodError from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
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
      if (error instanceof ZodError) throwZodError(error)

      throw error
    }
  }
}

export default SchemaValidator
