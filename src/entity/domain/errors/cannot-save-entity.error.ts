class ErrorCannotSaveEntity extends Error {
  constructor() {
    super('Cannot save a new entity')
    this.name = ErrorCannotSaveEntity.name
  }
}

export default ErrorCannotSaveEntity
