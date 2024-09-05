/* eslint-disable no-console */
import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/aplicaction/service/auth.service'
import type IJWTProvider from '../../../auth/domain/provider/jwt.interface.provider'
import DateUtils from '../../../shared/utils/date.util'
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
  constructor(
    private readonly repository: NeighborRepository,
    private readonly jwtProvider: IJWTProvider
  ) {
    this.repository = repository
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
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
        email: neighbor.email,
        role: 'neighbor'
      })
      const refreshToken = await authService.generateRefreshToken(neighbor.id, { email: neighbor.email })

      HandleHTTPResponse.Created(res, 'Neighbor registered successfully', {
        id: neighbor.id,
        accessToken,
        refreshToken
      })
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
