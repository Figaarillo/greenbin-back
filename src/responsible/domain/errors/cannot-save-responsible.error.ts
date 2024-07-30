class ErrorCannotSaveResponsible extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorCannotSaveResponsible.name
  }
}

export default ErrorCannotSaveResponsible
