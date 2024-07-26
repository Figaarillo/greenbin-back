import { z } from 'zod'
import { descriptionDTO, nameDTO } from './dto-types/dto-types'

const UpdateWasteCategoryDTO = z.object({
  name: nameDTO,
  description: descriptionDTO
})

export default UpdateWasteCategoryDTO
