class ErrorCannotSaveWaste extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new waste')
    this.name = ErrorCannotSaveWaste.name
  }
}

export default ErrorCannotSaveWaste
