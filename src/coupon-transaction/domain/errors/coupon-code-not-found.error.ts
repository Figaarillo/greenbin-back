class ErrorCouponCodeNotFound extends Error {
  readonly code: number = 404

  constructor(code?: string) {
    const message = code != null ? `Coupon code not found: ${code}` : 'Coupon code not found'

    super(message)
    this.name = ErrorCouponCodeNotFound.name
  }
}

export default ErrorCouponCodeNotFound
