class ErrorInvalidPassword extends Error {
  constructor() {
    super('Invalid entity password')
    this.name = ErrorInvalidPassword.name
  }
}

export default ErrorInvalidPassword
