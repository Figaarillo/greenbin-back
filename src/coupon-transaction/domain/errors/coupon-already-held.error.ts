class ErrorCouponAlreadyHeld extends Error {
  readonly code: number = 409

  constructor() {
    super('Ya canjeaste este cupón. Usalo antes de volver a canjearlo')
    this.name = ErrorCouponAlreadyHeld.name
  }
}

export default ErrorCouponAlreadyHeld
