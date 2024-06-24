import type IHttpErrorMessages from '@shared/domain/exceptions/http-error-message.interface.exeption'

const ErrorMessages: Record<string, IHttpErrorMessages> = {
  USER_NOT_FOUND: {
    message: 'User not found',
    statusCode: 404
  },
  USER_ALREADY_EXISTS: {
    message: 'User already exists',
    statusCode: 409
  },
  USER_SCHEMA_VALIDATION: {
    // eslint-disable-next-line quotes
    message: "Error validating user's schema",
    statusCode: 422
  },
  VALUE_OBJECT_FORMAT_EXCEPTION: {
    message: 'Error with value object format',
    statusCode: 422
  }
}

export default ErrorMessages
