class ErrorInvalidCredentialsProvided extends Error {
  readonly code = 401
  constructor() {
    super('Invalid password provided')
    this.name = ErrorInvalidCredentialsProvided.name
  }
}

export default ErrorInvalidCredentialsProvided
