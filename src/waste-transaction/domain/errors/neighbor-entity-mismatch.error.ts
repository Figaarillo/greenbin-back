class ErrorNeighborEntityMismatch extends Error {
  readonly code: number = 400

  constructor() {
    super('The neighbor does not belong to the same entity as the green point')
    this.name = ErrorNeighborEntityMismatch.name
  }
}

export default ErrorNeighborEntityMismatch
