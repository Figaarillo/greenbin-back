import { z } from 'zod'
import { descriptionDTO, nameDTO } from './dto-types/dto-types'
import { pointsPerWeightDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateWasteCategoryDTO = z.object({
  name: nameDTO.optional(),
  pointsPerWeight: pointsPerWeightDTO.optional(),
  description: descriptionDTO.optional()
})

export default UpdateWasteCategoryDTO
