import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteResponsibleUseCase from '../../application/usecases/delete.usecase'
import FindByEmailUseCase from '../../application/usecases/find-by-email.usecase'
import FindResponsibleByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListResponsiblesUseCase from '../../application/usecases/list.usecase'
import LoginResponsibleUseCase from '../../application/usecases/login.usecase'
import RegisterResponsibleUseCase from '../../application/usecases/register.usecase'
import UpdateResponsibleUseCase from '../../application/usecases/update.usecase'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterResponsibleDTO from '../dtos/register-responsible.dto'
import UpdateResponsibleDTO from '../dtos/update-responsible.dto'
import ResponsibleSchemaValidator from '../middlewares/zod-schema-validator.middleware'

class ResponsibleHandler {
  constructor(
    private readonly responsibleRepository: ResponsibleRepository,
    private readonly entityRepository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = GetPaginationParams(req)

    const listResponsibles = new ListResponsiblesUseCase(this.responsibleRepository)
    const responsibles = await listResponsibles.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Responsibles retrieved successfully', responsibles)
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = GetURLParams(req, 'id')

    const validateIDSchema = new ResponsibleSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findResponsible = new FindResponsibleByIDUseCase(this.responsibleRepository)
    const responsible = await findResponsible.exec(id)

    HandleHTTPResponse.OK(rep, 'Responsible retrieved successfully', responsible)
  }

  async register(req: FastifyRequest<{ Body: ResponsiblePayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterResponsiblesSchema = new ResponsibleSchemaValidator(RegisterResponsibleDTO, req.body)
    validateRegisterResponsiblesSchema.exec()

    const registerResponsible = new RegisterResponsibleUseCase(
      this.responsibleRepository,
      new FindEntityByIDUseCase(this.entityRepository)
    )
    const responsible = await registerResponsible.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Responsible registered successfully', { id: responsible.id })
  }

  async update(
    req: FastifyRequest<{ Body: ResponsiblePayload; Params: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const id = GetURLParams(req, 'id')

    const validateIDSchema = new ResponsibleSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new ResponsibleSchemaValidator(UpdateResponsibleDTO, req.body)
    schemaValidator.exec()

    const updateResponsible = new UpdateResponsibleUseCase(this.responsibleRepository)
    await updateResponsible.exec(id, req.body)

    HandleHTTPResponse.OK(rep, 'Responsible updated successfully', { id })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = GetURLParams(req, 'id')

    const schemaValidator = new ResponsibleSchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteResponsible = new DeleteResponsibleUseCase(this.responsibleRepository)
    await deleteResponsible.exec(id)

    HandleHTTPResponse.OK(rep, 'Responsible deleted successfully', { id })
  }

  async login(req: FastifyRequest<{ Body: ResponsiblePayload }>, rep: FastifyReply): Promise<void> {
    const login = new LoginResponsibleUseCase(this.responsibleRepository)
    const responsible = await login.exec(req.body)

    const authService = new AuthService(this.jwtStrategy)
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

    HandleHTTPResponse.OK(rep, 'Responsible logged successfully', {
      id: responsible.id,
      accessToken,
      refreshToken
    })
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenResponsible = req.responsible as { username: string; email: string; role: string }

    const findByEmail = new FindByEmailUseCase(this.responsibleRepository)
    const responsible = await findByEmail.exec(tokenResponsible.email)

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(req.responsible.id, {
      username: responsible.username,
      email: responsible.email,
      role: responsible.role
    })

    HandleHTTPResponse.OK(rep, 'Access token refreshed successfully', {
      accessToken
    })
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenEntity = req.tokenRole
    if (tokenEntity !== Roles.RESPONSIBLE) {
      throw new Error('Invalid role')
    }
    HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
  }
}

export default ResponsibleHandler
