class ErrorInvalidCredentialsProvided extends Error {
  readonly code: number

  constructor() {
    super('Invalid password provided')
    this.name = ErrorInvalidCredentialsProvided.name
    this.code = 401
  }
}

export default ErrorInvalidCredentialsProvided
