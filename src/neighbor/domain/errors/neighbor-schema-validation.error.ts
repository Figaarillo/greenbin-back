class ErrorNeighborSchemaValidation extends Error {
  constructor(
    title?: string,
    message?: string,
    public readonly details?: object,
    public readonly code?: number
  ) {
    super(message)
    this.name = title ?? ErrorNeighborSchemaValidation.name
  }
}

export default ErrorNeighborSchemaValidation
