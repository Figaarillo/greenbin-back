class ErrorInvalidPassword extends Error {
  constructor() {
    super('Invalid neighbor password')
    this.name = ErrorInvalidPassword.name
  }
}

export default ErrorInvalidPassword
