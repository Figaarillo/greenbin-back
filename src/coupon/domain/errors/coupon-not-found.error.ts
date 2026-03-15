class ErrorCouponNotFound extends Error {
  constructor(id?: string) {
    const message =
      id != null ? `Cannot find coupon with id: ${id}` : 'Cannot find any coupon when try to list all coupons'

    super(message)
    this.name = ErrorCouponNotFound.name
  }
}

export default ErrorCouponNotFound
