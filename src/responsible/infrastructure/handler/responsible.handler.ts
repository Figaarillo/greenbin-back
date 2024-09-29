import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteResponsibleUseCase from '../../aplication/usecases/delete.usecase'
import FindResponsibleByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListResponsiblesUseCase from '../../aplication/usecases/list.usecase'
import RegisterResponsibleUseCase from '../../aplication/usecases/register.usecase'
import UpdateResponsibleUseCase from '../../aplication/usecases/update.usecase'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterResponsibleDTO from '../dtos/register-responsible.dto'
import UpdateResponsibleDTO from '../dtos/update-responsible.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class ResponsibleHandler {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async List(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listResponsibles = new ListResponsiblesUseCase(this.repository)
      const responsibles = await listResponsibles.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Responsibles retrieved successfully', responsibles)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async FindByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findResponsible = new FindResponsibleByIDUseCase(this.repository)
      const responsible = await findResponsible.exec(id)

      HandleHTTPResponse.OK(res, 'Responsible retrieved successfully', responsible)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: ResponsiblePayload = req.body as ResponsiblePayload

      const validateRegisterResponsiblesSchema = new SchemaValidator(RegisterResponsibleDTO, payload)
      validateRegisterResponsiblesSchema.exec()

      const registerResponsible = new RegisterResponsibleUseCase(this.repository)
      const responsible = await registerResponsible.exec(payload)

      HandleHTTPResponse.Created(res, 'Responsible registered successfully', { id: responsible.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: ResponsiblePayload = req.body as ResponsiblePayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateResponsibleDTO, payload)
      schemaValidator.exec()

      const updateResponsible = new UpdateResponsibleUseCase(this.repository)
      await updateResponsible.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Responsible updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteResponsible = new DeleteResponsibleUseCase(this.repository)
      await deleteResponsible.exec(id)

      HandleHTTPResponse.OK(res, 'Responsible deleted successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default ResponsibleHandler
