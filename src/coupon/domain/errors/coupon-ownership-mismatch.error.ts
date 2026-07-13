class ErrorCouponOwnershipMismatch extends Error {
  readonly code: number = 403

  constructor() {
    super('El cupón no pertenece a este local.')
    this.name = ErrorCouponOwnershipMismatch.name
  }
}

export default ErrorCouponOwnershipMismatch
