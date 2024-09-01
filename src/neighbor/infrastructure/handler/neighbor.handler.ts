import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.response'
import { GetURLParams } from '../../../shared/utils/http.utils'
import RegisterNeighborUseCase from '../../aplication/usecases/register.usecase'
import UpdateNeighborUseCase from '../../aplication/usecases/update.usecase'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterNeighborDTO from '../dtos/register-neighbor.dto'
import UpdateNeighborDTO from '../dtos/update-neighbor.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class NeighborHandler {
  constructor(private readonly repository: NeighborRepository) {
    this.repository = repository
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: NeighborPayload = req.body as NeighborPayload

      const validateRegisterNeighborSchema = new SchemaValidator(RegisterNeighborDTO, payload)
      validateRegisterNeighborSchema.exec()

      const registerNeighbor = new RegisterNeighborUseCase(this.repository)
      const neighbor = await registerNeighbor.exec(payload)

      HandleHTTPResponse.Created(res, 'Neighbor registered successfully', { id: neighbor.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: NeighborPayload = req.body as NeighborPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateNeighborDTO, payload)
      schemaValidator.exec()

      const updateNeighbor = new UpdateNeighborUseCase(this.repository)
      await updateNeighbor.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Neighbor updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default NeighborHandler
