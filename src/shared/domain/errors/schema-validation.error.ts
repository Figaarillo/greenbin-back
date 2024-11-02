class ErrorSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorSchemaValidation.name
  }
}

export default ErrorSchemaValidation
