class ErrorCannotSaveCategory extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorCannotSaveCategory.name
  }
}

export default ErrorCannotSaveCategory
