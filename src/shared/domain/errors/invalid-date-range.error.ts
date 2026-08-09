class ErrorInvalidDateRange extends Error {
  readonly code = 400
  constructor(param: string, value: string) {
    super(`Invalid date for "${param}": "${value}". Use YYYY-MM-DD or a full ISO 8601 timestamp.`)
    this.name = ErrorInvalidDateRange.name
  }
}

export default ErrorInvalidDateRange
