class ErrorOffsetParameter extends Error {
  readonly code = 400
  constructor() {
    super('Offset parameter must be greater than or equal to 0')
    this.name = ErrorOffsetParameter.name
  }
}

export default ErrorOffsetParameter
