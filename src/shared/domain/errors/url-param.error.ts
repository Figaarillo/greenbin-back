class ErrorURLParams extends Error {
  readonly code = 400
  constructor(key: string) {
    super(`The URL parameter ${key} is required`)
    this.name = ErrorURLParams.name
  }
}

export default ErrorURLParams
