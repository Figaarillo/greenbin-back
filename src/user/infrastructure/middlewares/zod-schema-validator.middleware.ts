import type UserEntity from '@user/domain/entities/user.entity'
import ErrorUserSchemaValidation from '@user/domain/exceptions/user-schema-validation.error'
import { ZodError, type ZodType } from 'zod'

class SchemaValidator<T> {
  private readonly schema: ZodType<T>
  private readonly payload: Partial<UserEntity>

  constructor(schema: ZodType<T>, payload: Partial<UserEntity>) {
    this.schema = schema
    this.payload = payload
  }

  exec(): T {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorUserSchemaValidation(error.errors.map(err => err.message).join('\n'))
      }

      throw error
    }
  }
}

export default SchemaValidator
