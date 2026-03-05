interface CouponTransactionPayload {
  code: string
  status: string
  adquisitionDate: Date
  redeemDate: Date
  exportDate: Date
  costInPoints: number
  couponId: string
  neighborId: string
  rewardPartnerId: string
}

export default CouponTransactionPayload
