import { z } from 'zod'
import { descriptionDTO, nameDTO } from './dto-types/dto-types'

const UpdateGreenPointDTO = z.object({
  name: nameDTO.optional(),
  description: descriptionDTO.optional()
})

export default UpdateGreenPointDTO
