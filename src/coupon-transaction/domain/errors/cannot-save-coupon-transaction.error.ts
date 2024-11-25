class ErrorCannotSaveCouponTransaction extends Error {
  constructor() {
    super('Cannot save a new coupon transaction')
    this.name = ErrorCannotSaveCouponTransaction.name
  }
}

export default ErrorCannotSaveCouponTransaction
