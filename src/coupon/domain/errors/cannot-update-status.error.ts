class ErrorCannotUpdateStatus extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot update status of a coupon')
    this.name = ErrorCannotUpdateStatus.name
  }
}

export default ErrorCannotUpdateStatus
