class ErrorCannotSaveWasteTransactionDetail extends Error {
  constructor() {
    super('Cannot save a new waste transaction detail')
    this.name = ErrorCannotSaveWasteTransactionDetail.name
  }
}

export default ErrorCannotSaveWasteTransactionDetail
