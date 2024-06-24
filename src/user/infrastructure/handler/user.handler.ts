import { GetURLParams, GetURLQueryParams, type HTTPQueryParams } from '@shared/utils/http.utils'
import DeleteUser from '@user/aplication/usecases/delete.usecase'
import FindUserByIDUseCase from '@user/aplication/usecases/find-by-id.usecase'
import ListUsersUseCase from '@user/aplication/usecases/list.usecase'
import SaveUserUseCase from '@user/aplication/usecases/save.usecase'
import UpdateUserUseCase from '@user/aplication/usecases/update.usecase'
import type UserPayload from '@user/domain/payload/user.payload'
import type UserRepository from '@user/domain/repository/user.repository'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import IdDTO from '../dtos/id.dto'
import SaveUserDTO from '../dtos/save-user.dto'
import UpdateUserDTO from '../dtos/update-user.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '@shared/utils/http.response'

class UserHandler {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async List(req: FastifyRequest<{ Querystring: HTTPQueryParams }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetURLQueryParams(req)

      const listUsers = new ListUsersUseCase(this.repository)
      const users = await listUsers.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Users retrieved successfully', users)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async FindByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(IdDTO, { id })
      validateIDSchema.exec()

      const findUser = new FindUserByIDUseCase(this.repository)
      const user = await findUser.exec(id)

      HandleHTTPResponse.OK(res, 'User retrieved successfully', user)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Save(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: UserPayload = req.body as UserPayload

      const validateSaveUserSchema = new SchemaValidator(SaveUserDTO, payload)
      validateSaveUserSchema.exec()

      const saveUser = new SaveUserUseCase(this.repository)
      const user = await saveUser.exec(payload)

      HandleHTTPResponse.Created(res, 'User created successfully', { id: user.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: UserPayload = req.body as UserPayload

      const validateIDSchema = new SchemaValidator(IdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateUserDTO, payload)
      schemaValidator.exec()

      const updateUser = new UpdateUserUseCase(this.repository)
      await updateUser.exec(id, payload)

      HandleHTTPResponse.OK(res, 'User updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(IdDTO, { id })
      schemaValidator.exec()

      const deleteUser = new DeleteUser(this.repository)
      await deleteUser.exec(id)

      HandleHTTPResponse.OK(res, 'User deleted successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default UserHandler
