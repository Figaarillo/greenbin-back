class ErrorCannotSaveCoupon extends Error {
  constructor() {
    super('Cannot save a new coupon')
    this.name = ErrorCannotSaveCoupon.name
  }
}

export default ErrorCannotSaveCoupon
