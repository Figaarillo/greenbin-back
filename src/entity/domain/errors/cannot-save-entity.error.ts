class ErrorCannotSaveEntity extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorCannotSaveEntity.name
  }
}

export default ErrorCannotSaveEntity
