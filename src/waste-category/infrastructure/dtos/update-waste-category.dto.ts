import { z } from 'zod'
import { nameDTO, pointsPerWeightDTO, descriptionDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateWasteCategoryDTO = z.object({
  name: nameDTO.optional(),
  pointsPerWeight: pointsPerWeightDTO.optional(),
  description: descriptionDTO.optional(),
  isActive: z.boolean().optional()
})

export default UpdateWasteCategoryDTO
