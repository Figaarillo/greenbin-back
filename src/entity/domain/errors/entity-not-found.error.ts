class ErrorEntityNotFound extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorEntityNotFound.name
  }
}

export default ErrorEntityNotFound
