class ErrorMissingFields extends Error {
  readonly code = 400
  constructor(fields: string[]) {
    super(`Missing required fields: ${fields.join(', ')}`)
    this.name = ErrorMissingFields.name
  }
}

export default ErrorMissingFields
