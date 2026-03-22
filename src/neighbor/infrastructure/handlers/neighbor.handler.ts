import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getPaginationParams, getURLParams } from '../../../shared/utils/http.request.util'
import DeleteNeighborUseCase from '../../application/usecases/delete.usecase'
import FindNeighborByDNIUseCase from '../../application/usecases/find-by-dni.usecase'
import FindByEmailUseCase from '../../application/usecases/find-by-email.usecase'
import FindNeighborByIDUseCase from '../../application/usecases/find-by-id.usecase'
import GetWatesOfNeighborUseCase from '../../application/usecases/get-waste.usecase'
import ListNeighborsUseCase from '../../application/usecases/list.usecase'
import LoginNeighborUseCase from '../../application/usecases/login.usecase'
import RegisterNeighborUseCase from '../../application/usecases/register.usecase'
import UpdateNeighborUseCase from '../../application/usecases/update.usecase'
import type NeighborLoginPayload from '../../domain/payloads/neighbor.login.payload'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import LoginNeighborDTO from '../dtos/login-neighbor.dto'
import RegisterNeighborDTO from '../dtos/register-neighbor.dto'
import UpdateNeighborDTO from '../dtos/update-neighbor.dto'
import NeighborSchemaValidator from '../middlewares/zod-schema-validator.middleware'

class NeighborHandler {
  constructor(
    private readonly neighborRepository: NeighborRepository,
    private readonly entityRepository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const listNeighbor = new ListNeighborsUseCase(this.neighborRepository)
    const neighbors = await listNeighbor.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Neighbors retrieved successfully', neighbors)
  }

  async findById(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new NeighborSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findNeighbor = new FindNeighborByIDUseCase(this.neighborRepository)
    const neighbor = await findNeighbor.exec(id)

    HandleHTTPResponse.OK(rep, 'Neighbor retrieved successfully', neighbor)
  }

  async findByDni(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const dni = getURLParams(req, 'dni')

    const findByDNI = new FindNeighborByDNIUseCase(this.neighborRepository)
    const neighbor = await findByDNI.exec(dni)

    HandleHTTPResponse.OK(rep, 'Neighbor retrieved successfully', neighbor)
  }

  async register(req: FastifyRequest<{ Body: NeighborPayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterNeighborSchema = new NeighborSchemaValidator(RegisterNeighborDTO, req.body)
    validateRegisterNeighborSchema.exec()

    const registerNeighbor = new RegisterNeighborUseCase(
      this.neighborRepository,
      new FindEntityByIDUseCase(this.entityRepository)
    )
    const neighbor = await registerNeighbor.exec(req.body)

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(neighbor.id, {
      username: neighbor.username,
      email: neighbor.email,
      role: neighbor.role
    })
    const refreshToken = await authService.generateRefreshToken(neighbor.id, {
      username: neighbor.username,
      email: neighbor.email,
      role: neighbor.role
    })

    HandleHTTPResponse.Created(rep, 'Neighbor registered successfully', {
      id: neighbor.id,
      accessToken,
      refreshToken
    })
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')
    const payload: NeighborPayload = req.body as NeighborPayload

    const validateIDSchema = new NeighborSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new NeighborSchemaValidator(UpdateNeighborDTO, payload)
    schemaValidator.exec()

    const updateNeighbor = new UpdateNeighborUseCase(this.neighborRepository)
    await updateNeighbor.exec(id, payload)

    HandleHTTPResponse.OK(rep, 'Neighbor updated successfully', { id })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const schemaValidator = new NeighborSchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteNeighbor = new DeleteNeighborUseCase(this.neighborRepository)
    await deleteNeighbor.exec(id)

    HandleHTTPResponse.OK(rep, 'Neighbor deleted successfully', { id })
  }

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const paylaod = req.body as NeighborLoginPayload

    const schemaValidator = new NeighborSchemaValidator(LoginNeighborDTO, paylaod)
    schemaValidator.exec()

    const login = new LoginNeighborUseCase(this.neighborRepository)
    const neighbor = await login.exec(paylaod)
    if (!neighbor.isActive) {
      throw new Error('La cuenta está deshabilitada.')
    }

    if (!neighbor.isActive) {
      throw new Error('La cuenta está deshabilitada.')
    }

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(neighbor.id, {
      username: neighbor.username,
      email: neighbor.email,
      role: neighbor.role
    })
    const refreshToken = await authService.generateRefreshToken(neighbor.id, {
      username: neighbor.username,
      email: neighbor.email,
      role: neighbor.role
    })

    HandleHTTPResponse.OK(rep, 'Login successfully', {
      id: neighbor.id,
      accessToken,
      refreshToken
    })
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenNeighbor = req.neighbor as { username: string; email: string; role: string }

    const findByEmail = new FindByEmailUseCase(this.neighborRepository)
    const neighbor = await findByEmail.exec(tokenNeighbor.email)

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(req.neighbor.id, {
      username: neighbor.username,
      email: neighbor.email,
      role: neighbor.role
    })

    HandleHTTPResponse.OK(rep, 'Access token refreshed successfully', {
      accessToken
    })
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenEntity = req.tokenRole
    if (tokenEntity !== Roles.NEIGHBOR) {
      throw new Error('Invalid role')
    }
    HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
  }

  async getWastes(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const getWastes = new GetWatesOfNeighborUseCase(this.neighborRepository)
    const wastes = await getWastes.exec(id)

    HandleHTTPResponse.OK(rep, 'Wastes retrieved successfully', wastes)
  }
}

export default NeighborHandler
