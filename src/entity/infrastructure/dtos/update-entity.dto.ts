import { z } from 'zod'
import { descriptionDTO } from './dto-types/dto-types'

const UpdateEntityDTO = z.object({
  description: descriptionDTO
})

export default UpdateEntityDTO
