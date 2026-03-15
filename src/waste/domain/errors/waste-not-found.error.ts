class ErrorWasteNotFound extends Error {
  constructor(id?: string) {
    const message =
      id != null ? `Cannot find waste with id: ${id}` : 'Cannot find any waste when try to list all wastes'

    super(message)
    this.name = ErrorWasteNotFound.name
  }
}

export default ErrorWasteNotFound
