interface CouponUpdatePayload {
  title?: string
  description?: string
  discount?: number
  isAvailable?: boolean
  validDays?: number
  costInPoints?: number
}

export default CouponUpdatePayload
