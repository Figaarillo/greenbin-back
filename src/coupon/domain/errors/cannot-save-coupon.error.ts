class ErrorCannotSaveCoupon extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new coupon')
    this.name = ErrorCannotSaveCoupon.name
  }
}

export default ErrorCannotSaveCoupon
