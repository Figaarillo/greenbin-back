import { z } from 'zod'
import { descriptionDTO } from './dto-types/dto-types'

const UpdateWasteCategoryDTO = z.object({
  description: descriptionDTO
})

export default UpdateWasteCategoryDTO
