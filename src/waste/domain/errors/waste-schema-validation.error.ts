class ErrorWasteSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorWasteSchemaValidation.name
  }
}

export default ErrorWasteSchemaValidation
