interface RewardPartnerStats {
  totalAdquirido: number
  totalUsado: number
  totalExpirado: number
  totalPuntos: number
  discountRanges: {
    lt25: number
    from25to50: number
    from50to75: number
    gt75: number
  }
  uniqueNeighbors: number
  newNeighbors: number
  avgVisitsPerNeighbor: number
  byCoupon: Array<{
    couponId: string
    title: string
    redemptions: number
    uniqueNeighbors: number
    newNeighbors: number
    pointsSpent: number
  }>
}

export default RewardPartnerStats
