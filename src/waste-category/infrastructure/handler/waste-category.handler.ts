import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteCategoryUseCase from '../../aplication/usecases/delete.usecase'
import FindCategoryByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListCategoriesUseCase from '../../aplication/usecases/list.usecase'
import RegisterWasteCategoryUseCase from '../../aplication/usecases/register.usecase'
import UpdateCategoryUseCase from '../../aplication/usecases/update.usecase'
import type WasteCategoryPayload from '../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'
import RegisterWasteCategoryDTO from '../dtos/register-waste-category.dto'
import UpdateWasteCategoryDTO from '../dtos/update-waste-category.dto'

class WasteCategoryHandler {
  constructor(private readonly repository: WasteCategoryRepository) {
    this.repository = repository
  }

  async List(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listCategories = new ListCategoriesUseCase(this.repository)
      const entities = await listCategories.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Waste Categories retrieved successfully', entities)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async FindByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findCategory = new FindCategoryByIDUseCase(this.repository)
      const category = await findCategory.exec(id)

      HandleHTTPResponse.OK(res, 'Waste Category retrieved successfully', category)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WasteCategoryPayload = req.body as WasteCategoryPayload

      const validateRegisterCategoriesSchema = new SchemaValidator(RegisterWasteCategoryDTO, payload)
      validateRegisterCategoriesSchema.exec()

      const registerCategory = new RegisterWasteCategoryUseCase(this.repository)
      const category = await registerCategory.exec(payload)

      HandleHTTPResponse.Created(res, 'Waste Category registered successfully', { id: category.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: WasteCategoryPayload = req.body as WasteCategoryPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateWasteCategoryDTO, payload)
      schemaValidator.exec()

      const updateCategory = new UpdateCategoryUseCase(this.repository)
      await updateCategory.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Waste Category updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteCategory = new DeleteCategoryUseCase(this.repository)
      await deleteCategory.exec(id)

      HandleHTTPResponse.OK(res, 'Waste Category deleted successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default WasteCategoryHandler
