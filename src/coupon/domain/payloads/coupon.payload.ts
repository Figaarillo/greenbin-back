interface CouponPayload {
  title: string
  description: string
  discount: number
  isAvailable: boolean
  validDays: number
  costInPoints: number
  rewardPartnerId: string
}

export default CouponPayload
