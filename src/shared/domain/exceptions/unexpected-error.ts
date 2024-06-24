class ErrorUnexpectedEventOcurred extends Error {
  constructor(readonly message: string) {
    super(message)
    this.name = ErrorUnexpectedEventOcurred.name
  }
}

export default ErrorUnexpectedEventOcurred
