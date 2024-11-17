import { type FastifyReply, type FastifyRequest } from 'fastify'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import SchemaValidator from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import type WasteTransactionDetailRepository from '../../../waste-transaction-detail/domain/repositories/waste-transaction-detail.repository'
import type WasteRepository from '../../../waste/domain/repositories/waste.repository'
import FindByIdWasteTransactionByIDUseCase from '../../application/usecases/find-by-id.usecase'
import RegisterWasteDeliveryUseCase from '../../application/usecases/register-waste-delivery.usecase'
import RegisterWasteTransactionUseCase from '../../application/usecases/register.usecase'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterWasteTransactionDTO from '../dtos/register-waste-transaction.dto'

class WasteTransactionHandler {
  constructor(
    private readonly transactionDetailRepository: WasteTransactionDetailRepository,
    private readonly transactionRepository: WasteTransactionRepository,
    private readonly wasteRepository: WasteRepository,
    private readonly neighborRepository: NeighborRepository
  ) {}

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findWasteTransaction = new FindByIdWasteTransactionByIDUseCase(this.transactionRepository)
      const wasteTransaction = await findWasteTransaction.exec(id)

      HandleHTTPResponse.OK(res, 'Waste transaction retrieved successfully', wasteTransaction)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WasteTransactionPayload = req.body as WasteTransactionPayload

      const validateRegisterSchema = new SchemaValidator(RegisterWasteTransactionDTO, payload)
      validateRegisterSchema.exec()

      const registerWasteTransaction = new RegisterWasteTransactionUseCase(this.transactionRepository)
      const wasteTransaction = await registerWasteTransaction.exec(payload)

      HandleHTTPResponse.Created(res, 'Waste transaction registered successfully', { id: wasteTransaction.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async registerWasteDelivery(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WasteDeliveryPayload = req.body as WasteDeliveryPayload

      const registerWasteDelivery = new RegisterWasteDeliveryUseCase(
        this.transactionDetailRepository,
        this.transactionRepository,
        this.wasteRepository,
        this.neighborRepository,
        payload
      )
      const transaction = await registerWasteDelivery.exec()

      HandleHTTPResponse.Created(res, 'Waste delivery registered successfully', transaction)
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default WasteTransactionHandler
