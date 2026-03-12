class ErrorCannotSaveCategory extends Error {
  readonly code = 400

  constructor() {
    super('Cannot save a new waste category')
    this.name = ErrorCannotSaveCategory.name
  }
}

export default ErrorCannotSaveCategory
