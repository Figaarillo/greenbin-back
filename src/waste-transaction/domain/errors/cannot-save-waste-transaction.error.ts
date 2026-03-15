class ErrorCannotSaveWasteTransaction extends Error {
  constructor() {
    super('Cannot save a new waste transaction')
    this.name = ErrorCannotSaveWasteTransaction.name
  }
}

export default ErrorCannotSaveWasteTransaction
