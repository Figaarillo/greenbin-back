import { ZodError, type ZodType } from 'zod'
import type WasteCategoryEntity from '../../domain/entities/waste-category.entity'
import ErrorCategorySchemaValidation from '../../domain/errors/category-schema-validation.error'

class SchemaValidator<TDTOSchema> {
  private readonly schema: ZodType<TDTOSchema>
  private readonly payload: Partial<WasteCategoryEntity>

  constructor(schema: ZodType<TDTOSchema>, payload: Partial<WasteCategoryEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorCategorySchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
