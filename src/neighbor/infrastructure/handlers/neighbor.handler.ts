import AuthService from '../../../auth/aplicaction/service/auth.service'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTProvider from '../../../auth/domain/providers/jwt.interface.provider'
import DateUtils from '../../../shared/utils/date.util'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import FindByEmailUseCase from '../../aplication/usecases/find-by-email.usecase'
import FindNeighborByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListNeighborsUseCase from '../../aplication/usecases/list.usecase'
import LoginNeighborUseCase from '../../aplication/usecases/login.usecase'
import RegisterNeighborUseCase from '../../aplication/usecases/register.usecase'
import UpdateNeighborUseCase from '../../aplication/usecases/update.usecase'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterNeighborDTO from '../dtos/register-neighbor.dto'
import UpdateNeighborDTO from '../dtos/update-neighbor.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'
import DeleteNeighborUseCase from '../../aplication/usecases/delete.usecase'

class NeighborHandler {
  constructor(
    private readonly repository: NeighborRepository,
    private readonly jwtProvider: IJWTProvider
  ) {
    this.repository = repository
  }

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const usecase = new ListNeighborsUseCase(this.repository)
      const neighbors = await usecase.exec(offset, limit)

      HandleHTTPResponse.OK(rep, 'Neighbors retrieved successfully', neighbors)
    } catch (error) {}
  }

  async findById(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findNeighbor = new FindNeighborByIDUseCase(this.repository)
      const neighbor = await findNeighbor.exec(id)

      HandleHTTPResponse.OK(rep, 'Neighbor retrieved successfully', neighbor)
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const validateRegisterNeighborSchema = new SchemaValidator(RegisterNeighborDTO, req.body as NeighborPayload)
      validateRegisterNeighborSchema.exec()

      const payload: NeighborPayload = {
        ...(req.body as any),
        birthdate: DateUtils.parseDate((req.body as any).birthdate as string)
      }

      const registerNeighbor = new RegisterNeighborUseCase(this.repository)
      const neighbor = await registerNeighbor.exec(payload)

      const authService = new AuthService(this.jwtProvider)
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
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: NeighborPayload = req.body as NeighborPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateNeighborDTO, payload)
      schemaValidator.exec()

      const updateNeighbor = new UpdateNeighborUseCase(this.repository)
      await updateNeighbor.exec(id, payload)

      HandleHTTPResponse.OK(rep, 'Neighbor updated successfully', { id })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenNeighbor = req.neighbor as { username: string; email: string; role: string }

      const usecase = new FindByEmailUseCase(this.repository)
      const neighbor = await usecase.exec(tokenNeighbor.email)

      const authService = new AuthService(this.jwtProvider)
      const accessToken = await authService.generateAccessToken(req.neighbor.id, {
        username: neighbor.username,
        email: neighbor.email,
        role: neighbor.role
      })

      HandleHTTPResponse.OK(rep, 'Access token refreshed successfully', {
        accessToken
      })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteNeighbor = new DeleteNeighborUseCase(this.repository)
      await deleteNeighbor.exec(id)

      HandleHTTPResponse.OK(rep, 'Neighbor deleted successfully', { id })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const paylaod = req.body as NeighborPayload

      const usecase = new LoginNeighborUseCase(this.repository)
      const neighbor = await usecase.exec(paylaod)

      const authService = new AuthService(this.jwtProvider)
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
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenEntity = req.tokenRole
      if (tokenEntity !== Roles.NEIGHBOR) {
        throw new Error('Invalid role')
      }
      HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
    } catch (error) {
      rep.status(500).send(error)
    }
  }
}

export default NeighborHandler
