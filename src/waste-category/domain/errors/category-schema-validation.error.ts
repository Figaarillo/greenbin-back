class ErrorCategorySchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorCategorySchemaValidation.name
  }
}

export default ErrorCategorySchemaValidation
