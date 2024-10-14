class ErrorGreenPointSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorGreenPointSchemaValidation.name
  }
}

export default ErrorGreenPointSchemaValidation
