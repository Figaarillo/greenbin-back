import { z } from 'zod'
import { cuitDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const CheckCuitDTO = z.object({
  cuit: cuitDTO
})

export default CheckCuitDTO
