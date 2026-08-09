interface RewardPartnerRanking {
  rewardPartnerId: string
  name: string
  /** Cupones que el vecino presentó y el local marcó como usados. */
  used: number
  /** Canjeados con puntos pero todavía sin presentar en el local. */
  acquired: number
  expired: number
  /** Puntos que los vecinos gastaron en los cupones usados de este local. */
  pointsSpent: number
}

export default RewardPartnerRanking
