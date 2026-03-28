import { type FastifyReply, type FastifyRequest } from 'fastify'
import FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams } from '../../../shared/utils/http.request.util'
import FindWasteCategoryByIDUseCase from '../../../waste-category/application/usecases/find-by-id.usecase'
import type WasteCategoryRepository from '../../../waste-category/domain/repositories/waste-category.repository'
import RegisterWasteTransactionDetailUseCase from '../../../waste-transaction-detail/application/usecases/register.usecase'
import type WasteTransactionDetailRepository from '../../../waste-transaction-detail/domain/repositories/waste-transaction-detail.repository'
import FindWasteByIDUseCase from '../../../waste/application/usecases/find-by-id.usecase'
import RegisterWasteUseCase from '../../../waste/application/usecases/register.usecase'
import type WasteRepository from '../../../waste/domain/repositories/waste.repository'
import FindWasteTransactionByIDUseCase from '../../application/usecases/find-by-id.usecase'
import RegisterWasteDeliveryUseCase from '../../application/usecases/register-waste-delivery.usecase'
import RegisterWasteTransactionUseCase from '../../application/usecases/register.usecase'
import UpdateWasteTransactionUseCase from '../../application/usecases/update.usecase'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'
import RegisterWasteTransactionDTO from '../dtos/register-waste-transaction.dto'
import WasteTransactionSchemaValidator from '../middlewares/zod-schema-validator.middleware'
import ListWasteTransactionsByNeighborUseCase from '../../application/usecases/list-by-neighbor.usecase'
import ListWasteTransactionsByResponsibleUseCase from '../../application/usecases/list-by-responsible.usecase'

class WasteTransactionHandler {
  constructor(
    private readonly transactionDetailRepository: WasteTransactionDetailRepository,
    private readonly transactionRepository: WasteTransactionRepository,
    private readonly wasteRepository: WasteRepository,
    private readonly neighborRepository: NeighborRepository,
    private readonly categoryRepository: WasteCategoryRepository
  ) {}

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new WasteTransactionSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findWasteTransaction = new FindWasteTransactionByIDUseCase(this.transactionRepository)
    const wasteTransaction = await findWasteTransaction.exec(id)

    HandleHTTPResponse.OK(rep, 'Waste transaction retrieved successfully', wasteTransaction)
  }

  async listByNeighbor(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const neighborId = getURLParams(req, 'neighborId')

    const listByNeighbor = new ListWasteTransactionsByNeighborUseCase(this.transactionRepository)
    const transactions = await listByNeighbor.exec(neighborId)

    HandleHTTPResponse.OK(rep, 'Waste transactions retrieved successfully', transactions)
  }

  async listByResponsible(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const responsibleId = getURLParams(req, 'responsibleId')

    const listByResponsible = new ListWasteTransactionsByResponsibleUseCase(this.transactionRepository)
    const transactions = await listByResponsible.exec(responsibleId)

    HandleHTTPResponse.OK(rep, 'Waste transactions retrieved successfully', transactions)
  }

  async register(req: FastifyRequest<{ Body: WasteTransactionPayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterSchema = new WasteTransactionSchemaValidator(RegisterWasteTransactionDTO, req.body)
    validateRegisterSchema.exec()

    const registerWasteTransaction = new RegisterWasteTransactionUseCase(this.transactionRepository)
    const wasteTransaction = await registerWasteTransaction.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Waste transaction registered successfully', { id: wasteTransaction.id })
  }

  async registerWasteDelivery(req: FastifyRequest<{ Body: WasteDeliveryPayload }>, rep: FastifyReply): Promise<void> {
    const registerWasteDelivery = new RegisterWasteDeliveryUseCase(
      new RegisterWasteTransactionUseCase(this.transactionRepository),
      new UpdateWasteTransactionUseCase(this.transactionRepository),
      new RegisterWasteTransactionDetailUseCase(
        this.transactionDetailRepository,
        new FindWasteTransactionByIDUseCase(this.transactionRepository),
        new FindWasteByIDUseCase(this.wasteRepository)
      ),
      new RegisterWasteUseCase(this.wasteRepository, new FindWasteCategoryByIDUseCase(this.categoryRepository)),
      new FindNeighborByIDUseCase(this.neighborRepository)
    )

    const wasteDelivery = await registerWasteDelivery.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Waste delivery registered successfully', { id: wasteDelivery.id })
  }
}

export default WasteTransactionHandler
