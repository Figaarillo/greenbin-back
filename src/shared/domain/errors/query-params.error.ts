class ErrorQueryParamMissing extends Error {
  readonly code = 400
  constructor(propKey: string) {
    super(`The query parameter ${propKey} most be not empty string`)
    this.name = ErrorQueryParamMissing.name
  }
}

export default ErrorQueryParamMissing
