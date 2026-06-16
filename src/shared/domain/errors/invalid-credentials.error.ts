class ErrorInvalidCredentialsProvided extends Error {
  readonly code = 401
  constructor(message: string = 'Invalid password provided') {
    super(message)
    this.name = ErrorInvalidCredentialsProvided.name
  }
}

export default ErrorInvalidCredentialsProvided
