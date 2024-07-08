import RegisterEntityUseCase from '@entity/aplication/usecases/register.usecase'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '@shared/utils/http.response'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import RegisterEntityDTO from '../dtos/register-entity.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class EntityHandler {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: EntityPayload = req.body as EntityPayload

      const validateRegisterEntitySchema = new SchemaValidator(RegisterEntityDTO, payload)
      validateRegisterEntitySchema.exec()

      const registerEntity = new RegisterEntityUseCase(this.repository)
      const entity = await registerEntity.exec(payload)

      HandleHTTPResponse.Created(res, 'Entity registered successfully', { id: entity.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default EntityHandler
