import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteTransactionDetailDTO = z.object({
  waste: idDTO
})

export default RegisterWasteTransactionDetailDTO
