import { z } from 'zod'
import { descriptionDTO, nameDTO, passwordDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateEntityDTO = z.object({
  name: nameDTO.optional(),
  description: descriptionDTO.optional(),
  password: passwordDTO.optional()
})

export default UpdateEntityDTO
