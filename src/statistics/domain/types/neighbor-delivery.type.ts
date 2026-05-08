interface NeighborDelivery {
  transactionId: string
  date: string
  greenPointName: string
  totalPoints: number
  details: Array<{
    categoryName: string
    weight: number
    points: number
  }>
}

export default NeighborDelivery
