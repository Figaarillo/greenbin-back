class ErrorNotEnoughPoints extends Error {
  readonly code: number = 409

  constructor() {
    super('No tenés puntos suficientes para canjear este cupón.')
    this.name = ErrorNotEnoughPoints.name
  }
}

export default ErrorNotEnoughPoints
