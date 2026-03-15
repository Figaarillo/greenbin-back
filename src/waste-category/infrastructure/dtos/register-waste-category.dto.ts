import { z } from 'zod'
import { nameDTO, descriptionDTO, pointsPerWeightDTO, co2DTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteCategoryDTO = z.object({
  name: nameDTO,
  description: descriptionDTO,
  pointsPerWeight: pointsPerWeightDTO,
  co2: co2DTO
})

export default RegisterWasteCategoryDTO
