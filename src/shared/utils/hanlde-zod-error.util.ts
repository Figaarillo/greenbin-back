import { type ZodError, type ZodIssue } from 'zod'
import ErrorSchemaValidation from '../domain/errors/schema-validation.error'

function handleZodError(error: ZodError): Error {
  const detailedErrors = formatZodErrorsToString(error.errors)
  throw new ErrorSchemaValidation(
    JSON.stringify({
      message: 'Validation errors occurred',
      errors: detailedErrors
    })
  )
}

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

export const formatZodErrorsToString = (errors: ZodIssue[]): string =>
  errors.reduce((msg, err) => `${msg}${capitalize(err.path.join('.'))}: ${err.message}. `, '')

export const formatZodErrorsToObject = (errors: ZodIssue[]): object => {
  return errors.map(err => ({
    field: err.path.join('.'),
    error: err.message
  }))
}

export default handleZodError
