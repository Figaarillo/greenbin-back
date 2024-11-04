class ErrorCannotSaveWaste extends Error {
  constructor() {
    super('Cannot save a new waste')
    this.name = ErrorCannotSaveWaste.name
  }
}

export default ErrorCannotSaveWaste
