class ErrorCannotSaveGreenPoint extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save new green point')
    this.name = ErrorCannotSaveGreenPoint.name
  }
}

export default ErrorCannotSaveGreenPoint
