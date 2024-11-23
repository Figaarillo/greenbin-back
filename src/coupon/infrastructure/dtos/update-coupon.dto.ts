import { z } from 'zod'
import {
  costInPointsDTO,
  descriptionDTO,
  discountDTO,
  titleDTO,
  validDaysDTO
} from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateCouponDTO = z.object({
  title: titleDTO.optional(),
  description: descriptionDTO.optional(),
  discount: discountDTO.optional(),
  isAvailable: z.boolean().optional(),
  validDays: validDaysDTO.optional(),
  costInPoints: costInPointsDTO.optional()
})

export default UpdateCouponDTO
