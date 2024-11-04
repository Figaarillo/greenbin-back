class ErrorCannotSaveCategory extends Error {
  constructor() {
    super('Cannot save a new waste category')
    this.name = ErrorCannotSaveCategory.name
  }
}

export default ErrorCannotSaveCategory
