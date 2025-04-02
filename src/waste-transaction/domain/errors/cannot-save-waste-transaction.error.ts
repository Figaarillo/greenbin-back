class ErrorCannotSaveWasteTransaction extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new waste transaction')
    this.name = ErrorCannotSaveWasteTransaction.name
  }
}

export default ErrorCannotSaveWasteTransaction
