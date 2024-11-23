import { z } from 'zod'
import { idDTO, weightDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteDTO = z.object({
  categoryId: idDTO,
  weight: weightDTO
})

export default RegisterWasteDTO
