class ErrorNoCouponsAvailable extends Error {
  readonly code: number = 404

  constructor() {
    super('no coupons were found available')
    this.name = ErrorNoCouponsAvailable.name
  }
}

export default ErrorNoCouponsAvailable
