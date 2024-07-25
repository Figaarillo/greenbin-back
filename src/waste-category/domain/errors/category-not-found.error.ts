class ErrorCategoryNotFound extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorCategoryNotFound.name
  }
}

export default ErrorCategoryNotFound
