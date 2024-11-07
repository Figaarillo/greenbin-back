import { z } from 'zod'
import { descriptionDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateEntityDTO = z.object({
  description: descriptionDTO
})

export default UpdateEntityDTO
