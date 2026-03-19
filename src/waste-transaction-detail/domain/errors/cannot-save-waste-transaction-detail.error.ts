class ErrorCannotSaveWasteTransactionDetail extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new waste transaction detail')
    this.name = ErrorCannotSaveWasteTransactionDetail.name
  }
}

export default ErrorCannotSaveWasteTransactionDetail
