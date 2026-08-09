// El cupón existía cuando el vecino abrió el catálogo, pero el local lo borró o
// lo marcó como no disponible antes de que llegara a canjearlo. Es un 409 y no
// un 404: para el vecino no es "no existe", es "se te fue".
class ErrorCouponNoLongerAvailable extends Error {
  readonly code: number = 409

  constructor() {
    super('Este cupón ya no está disponible.')
    this.name = ErrorCouponNoLongerAvailable.name
  }
}

export default ErrorCouponNoLongerAvailable
