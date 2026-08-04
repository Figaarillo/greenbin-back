interface PointsBalance {
  /** Puntos que la entidad otorgó por entregas de residuos. */
  granted: number
  /** Puntos que los vecinos gastaron canjeando cupones. */
  spent: number
  /** Saldo vigente de los vecinos: lo que pueden gastar hoy en los locales. */
  outstanding: number
  neighborsWithBalance: number
}

export default PointsBalance
