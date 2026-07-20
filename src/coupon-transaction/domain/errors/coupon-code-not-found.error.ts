class ErrorCouponCodeNotFound extends Error {
  readonly code: number = 404

  constructor() {
    super('El código de cupón no es válido, por favor verifíquelo nuevamente.')
    this.name = ErrorCouponCodeNotFound.name
  }
}

export default ErrorCouponCodeNotFound
