class ErrorTooManyLoginAttempts extends Error {
  readonly code = 429
  constructor(message: string = 'Too many login attempts, please try again later') {
    super(message)
    this.name = ErrorTooManyLoginAttempts.name
  }
}

export default ErrorTooManyLoginAttempts
