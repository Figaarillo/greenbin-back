class ErrorResponsibleNotFound extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorResponsibleNotFound.name
  }
}

export default ErrorResponsibleNotFound
