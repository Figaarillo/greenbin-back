import { z } from 'zod'
import { nameDTO } from './dto-types/dto-types'

const CheckNameDTO = z.object({
  name: nameDTO
})

export default CheckNameDTO
