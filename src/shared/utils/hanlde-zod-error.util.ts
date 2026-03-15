import { type ZodError, type ZodIssue } from 'zod'
import ErrorSchemaValidation from '../domain/errors/schema-validation.error'

function handleZodError(error: ZodError): Error {
  const detailedErrors = formatZodErrors(error.errors)
  throw new ErrorSchemaValidation(
    JSON.stringify({
      message: 'Validation errors occurred',
      errors: detailedErrors
    })
  )
}

function formatZodErrors(errors: ZodIssue[]): Array<{ field: string; error: string }> {
  return errors.map(err => ({
    field: err.path.join('.'),
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    error: err.message || 'Invalid value'
  }))
}

export default handleZodError
