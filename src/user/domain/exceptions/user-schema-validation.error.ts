class ErrorUserSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorUserSchemaValidation.name
  }
}

export default ErrorUserSchemaValidation
