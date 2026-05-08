class ErrorCannotSaveNeighbor extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new neighbor')
    this.name = ErrorCannotSaveNeighbor.name
  }
}

export default ErrorCannotSaveNeighbor
