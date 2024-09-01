class ErrorCannotSaveNeighbor extends Error {
  constructor() {
    super('Cannot save a new neighbor')
    this.name = ErrorCannotSaveNeighbor.name
  }
}

export default ErrorCannotSaveNeighbor
