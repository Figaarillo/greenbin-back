import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteTransactionDTO = z.object({
  responsible: idDTO,
  neighbor: idDTO,
  greenPointd: idDTO,
  transactionDetails: idDTO
})

export default RegisterWasteTransactionDTO
