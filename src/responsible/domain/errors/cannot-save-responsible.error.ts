class ErrorCannotSaveResponsible extends Error {
  constructor() {
    super('Cannot save new responsible')
    this.name = ErrorCannotSaveResponsible.name
  }
}

export default ErrorCannotSaveResponsible
