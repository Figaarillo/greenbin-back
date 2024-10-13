import { z } from 'zod'
import { descriptionDTO, nameDTO } from './dto-types/dto-types'

const UpdateGreenPointDTO = z.object({
  name: nameDTO,
  description: descriptionDTO
})

export default UpdateGreenPointDTO
