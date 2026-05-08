class ErrorCannotSaveResponsible extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save new responsible')
    this.name = ErrorCannotSaveResponsible.name
  }
}

export default ErrorCannotSaveResponsible
