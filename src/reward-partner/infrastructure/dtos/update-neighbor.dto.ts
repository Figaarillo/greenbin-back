import { z } from 'zod'
import { addressDTO, emailDTO, nameDTO } from './dto-types/dto-types'

const UpdateNeighborDTO = z.object({
  name: nameDTO.optional(),
  address: addressDTO.optional(),
  email: emailDTO.optional()
})

export default UpdateNeighborDTO
