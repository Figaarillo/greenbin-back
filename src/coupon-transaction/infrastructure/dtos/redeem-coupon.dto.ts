import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RedeemCouponDTO = z.object({
  couponId: idDTO,
  neighborId: idDTO
})

export default RedeemCouponDTO
