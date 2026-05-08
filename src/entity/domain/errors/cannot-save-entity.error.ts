class ErrorCannotSaveEntity extends Error {
  public readonly code: number = 500

  constructor() {
    super('Cannot save a new entity')
    this.name = ErrorCannotSaveEntity.name
  }
}

export default ErrorCannotSaveEntity
