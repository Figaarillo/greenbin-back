class ErrorSchemaValidation extends Error {
  readonly code: number = 400

  constructor(
    title?: string,
    message?: string,
    public readonly details?: object
  ) {
    super(message)
    this.name = title ?? ErrorSchemaValidation.name
  }
}

export default ErrorSchemaValidation
