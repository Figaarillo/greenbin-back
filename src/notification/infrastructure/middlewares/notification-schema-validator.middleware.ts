import { ZodError, type ZodType } from 'zod'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import { formatZodErrorsToObject, formatZodErrorsToString } from '../../../shared/utils/hanlde-zod-error.util'
import type NotificationPreferencePatch from '../../domain/payloads/notification-preference.payload'

class NotificationSchemaValidator<TDTOSchema> {
  constructor(
    private readonly schema: ZodType<TDTOSchema>,
    private readonly payload: NotificationPreferencePatch
  ) {}

  exec(): TDTOSchema {
    try {
      return this.schema.parse(this.payload)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ErrorSchemaValidation(
          'Validation error on notification preference payload',
          formatZodErrorsToString(error.errors),
          formatZodErrorsToObject(error.errors)
        )
      }

      throw error
    }
  }
}

export default NotificationSchemaValidator
