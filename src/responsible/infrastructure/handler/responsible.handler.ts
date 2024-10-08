import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/aplicaction/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTProvider from '../../../auth/domain/providers/jwt.interface.provider'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteResponsibleUseCase from '../../aplication/usecases/delete.usecase'
import FindByEmailUseCase from '../../aplication/usecases/find-by-email.usecase'
import FindResponsibleByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListResponsiblesUseCase from '../../aplication/usecases/list.usecase'
import LoginResponsibleUseCase from '../../aplication/usecases/login.usecase'
import RegisterResponsibleUseCase from '../../aplication/usecases/register.usecase'
import UpdateResponsibleUseCase from '../../aplication/usecases/update.usecase'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterResponsibleDTO from '../dtos/register-responsible.dto'
import UpdateResponsibleDTO from '../dtos/update-responsible.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class ResponsibleHandler {
  constructor(
    private readonly repository: ResponsibleRepository,
    private readonly jwtProvider: IJWTProvider
  ) {
    this.repository = repository
    this.jwtProvider = jwtProvider
  }

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listResponsibles = new ListResponsiblesUseCase(this.repository)
      const responsibles = await listResponsibles.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Responsibles retrieved successfully', responsibles)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
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

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
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

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
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

  async delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
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

  async login(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload = req.body as ResponsiblePayload

      const usecase = new LoginResponsibleUseCase(this.repository)
      const responsible = await usecase.exec(payload)

      const authService = new AuthService(this.jwtProvider)
      const accessToken = await authService.generateAccessToken(responsible.id, {
        username: responsible.username,
        email: responsible.email,
        role: responsible.role
      })
      const refreshToken = await authService.generateRefreshToken(responsible.id, {
        username: responsible.username,
        email: responsible.email,
        role: responsible.role
      })

      HandleHTTPResponse.OK(res, 'Responsible logged successfully', {
        id: responsible.id,
        accessToken,
        refreshToken
      })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenResponsible = req.responsible as { username: string; email: string; role: string }

      const usecase = new FindByEmailUseCase(this.repository)
      const responsible = await usecase.exec(tokenResponsible.email)

      const authService = new AuthService(this.jwtProvider)
      const accessToken = await authService.generateAccessToken(req.responsible.id, {
        username: responsible.username,
        email: responsible.email,
        role: responsible.role
      })

      HandleHTTPResponse.OK(rep, 'Access token refreshed successfully', {
        accessToken
      })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenEntity = req.tokenRole
      if (tokenEntity !== Roles.RESPONSIBLE) {
        throw new Error('Invalid role')
      }
      HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
    } catch (error) {
      rep.status(500).send(error)
    }
  }
}

export default ResponsibleHandler
