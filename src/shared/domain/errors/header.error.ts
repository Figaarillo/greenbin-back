class ErrorHeader extends Error {
  readonly code = 401
  constructor(key: string) {
    super(`The header ${key} is required`)
    this.name = ErrorHeader.name
  }
}

export default ErrorHeader
