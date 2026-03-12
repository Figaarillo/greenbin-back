class ErrorWasteTransactionNotFound extends Error {
  readonly code: number = 404

  constructor(id?: string) {
    const message =
      id != null
        ? `Cannot find waste transaction with id: ${id}`
        : 'Cannot find any waste transaction when try to list all transactions'

    super(message)
    this.name = ErrorWasteTransactionNotFound.name
  }
}

export default ErrorWasteTransactionNotFound
