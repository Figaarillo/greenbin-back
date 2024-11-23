import { z } from 'zod'
import { idDTO } from '../../../green-point/infrastructure/dtos/dto-types/dto-types'
import {
  costInPointsDTO,
  descriptionDTO,
  discountDTO,
  titleDTO,
  validDaysDTO
} from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterCouponDTO = z.object({
  title: titleDTO,
  description: descriptionDTO,
  discount: discountDTO,
  isAvailable: z.boolean(),
  validDays: validDaysDTO,
  costInPoints: costInPointsDTO,
  rewardPartnerId: idDTO
})

export default RegisterCouponDTO
