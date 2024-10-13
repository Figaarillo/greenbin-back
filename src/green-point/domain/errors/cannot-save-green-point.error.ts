class ErrorCannotSaveGreenPoint extends Error {
  constructor() {
    super('Cannot save new GreenPoint')
    this.name = ErrorCannotSaveGreenPoint.name
  }
}

export default ErrorCannotSaveGreenPoint
