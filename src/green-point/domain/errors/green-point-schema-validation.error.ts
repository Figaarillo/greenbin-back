class ErrorEntitySchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorEntitySchemaValidation.name
  }
}

export default ErrorEntitySchemaValidation
