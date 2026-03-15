import { ZodError, type ZodType } from 'zod'
import handleZodError from '../../../shared/utils/hanlde-zod-error.util'
import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'

class WasteCategorySchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: Partial<WasteCategoryEntity>
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

export default WasteCategorySchemaValidator
