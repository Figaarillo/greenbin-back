class ErrorResponsibleSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorResponsibleSchemaValidation.name
  }
}

export default ErrorResponsibleSchemaValidation
