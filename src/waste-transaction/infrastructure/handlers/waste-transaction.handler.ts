import { type FastifyReply, type FastifyRequest } from 'fastify'
import SchemaValidator from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import FindByIdWasteTransactionByIDUseCase from '../../application/usecases/find-by-id.usecase'
import RegisterWasteTransactionUseCase from '../../application/usecases/register.usecase'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterWasteTransactionDTO from '../dtos/register-waste-transaction.dto'

class WasteTransactionHandler {
  constructor(private readonly repository: WasteTransactionRepository) {
    this.repository = repository
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findWasteTransaction = new FindByIdWasteTransactionByIDUseCase(this.repository)
      const wasteTransaction = await findWasteTransaction.exec(id)

      HandleHTTPResponse.OK(res, 'WasteTransactionTransaction retrieved successfully', wasteTransaction)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WasteTransactionPayload = req.body as WasteTransactionPayload

      const validateRegisterSchema = new SchemaValidator(RegisterWasteTransactionDTO, payload)
      validateRegisterSchema.exec()

      const registerWasteTransaction = new RegisterWasteTransactionUseCase(this.repository)
      const WasteTransaction = await registerWasteTransaction.exec(payload)

      HandleHTTPResponse.Created(res, 'WasteTransaction registered successfully', { id: WasteTransaction.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default WasteTransactionHandler
