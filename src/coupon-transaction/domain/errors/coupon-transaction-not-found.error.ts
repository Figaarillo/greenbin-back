class ErrorCouponTransactionNotFound extends Error {
  readonly code: number = 404

  constructor(id?: string) {
    const message =
      id != null
        ? `Cannot find coupon transaction with id: ${id}`
        : 'Cannot find any coupon transaction when try to list all transactions'

    super(message)
    this.name = ErrorCouponTransactionNotFound.name
  }
}

export default ErrorCouponTransactionNotFound
