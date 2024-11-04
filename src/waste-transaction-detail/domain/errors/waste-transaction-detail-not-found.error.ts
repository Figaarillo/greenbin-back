class ErrorWasteTransactionDetailNotFound extends Error {
  constructor(id?: string) {
    const message =
      id != null
        ? `Cannot find transaction detail with id: ${id}`
        : 'Cannot find any transaction detail when try to list all transaction details'

    super(message)
    this.name = ErrorWasteTransactionDetailNotFound.name
  }
}

export default ErrorWasteTransactionDetailNotFound
