class ErrorNeighborNotFound extends Error {
  constructor(id: string) {
    super(`Cannot update neighbor with id: ${id}`)
    this.name = ErrorNeighborNotFound.name
  }
}

export default ErrorNeighborNotFound
