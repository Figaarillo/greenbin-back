class ErrorNeighborSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorNeighborSchemaValidation.name
  }
}

export default ErrorNeighborSchemaValidation
