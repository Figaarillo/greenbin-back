import { z } from 'zod'
import { idDTO, weightDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteDTO = z.object({
  category: idDTO,
  weight: weightDTO
})

export default RegisterWasteDTO
