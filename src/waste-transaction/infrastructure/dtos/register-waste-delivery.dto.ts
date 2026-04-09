import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const WasteDTO = z.object({
  categoryId: idDTO,
  weight: z.number().positive({ message: 'The weight must be a positive number' })
})

const RegisterWasteDeliveryDTO = z.object({
  responsibleId: idDTO,
  neighborId: idDTO,
  greenPointId: idDTO,
  wastes: z.array(WasteDTO).min(1)
})

export default RegisterWasteDeliveryDTO
