class ErrorLimitParameter extends Error {
  readonly code = 400
  constructor() {
    super('Limit parameter must be greater than 1')
    this.name = ErrorLimitParameter.name
  }
}

export default ErrorLimitParameter
