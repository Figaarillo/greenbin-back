class ErrorInvalidPassword extends Error {
  constructor() {
    super('Invalid reward partner password')
    this.name = ErrorInvalidPassword.name
  }
}

export default ErrorInvalidPassword
