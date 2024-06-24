class ErrorUserNotFound extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorUserNotFound.name
  }
}

export default ErrorUserNotFound
