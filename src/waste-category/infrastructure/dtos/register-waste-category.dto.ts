import { z } from 'zod'
import { nameDTO, descriptionDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteCategoryDTO = z.object({
  name: nameDTO,
  description: descriptionDTO
})

export default RegisterWasteCategoryDTO
