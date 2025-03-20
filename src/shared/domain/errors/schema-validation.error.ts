class ErrorSchemaValidation extends Error {
  constructor(
    title?: string,
    message?: string,
    public readonly details?: object,
    public readonly code?: number
  ) {
    super(message)
    this.name = title ?? ErrorSchemaValidation.name
  }
}

export default ErrorSchemaValidation
