class ErrorCannotUpdateCouponStatus extends Error {
  readonly code: number = 400

  constructor(id: string) {
    super('Error updating coupon with id: ' + id)
    this.name = ErrorCannotUpdateCouponStatus.name
  }
}

export default ErrorCannotUpdateCouponStatus
