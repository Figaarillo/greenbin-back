import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getPaginationParams, getURLParams } from '../../../shared/utils/http.request.util'
import DeleteCategoryUseCase from '../../application/usecases/delete.usecase'
import FindWasteCategoryByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListCategoriesUseCase from '../../application/usecases/list.usecase'
import RegisterWasteCategoryUseCase from '../../application/usecases/register.usecase'
import UpdateCategoryUseCase from '../../application/usecases/update.usecase'
import type WasteCategoryPayload from '../../domain/payloads/waste-category.payload'
import type WasteCategoryRepository from '../../domain/repositories/waste-category.repository'
import RegisterWasteCategoryDTO from '../dtos/register-waste-category.dto'
import UpdateWasteCategoryDTO from '../dtos/update-waste-category.dto'
import WasteCategorySchemaValidator from '../middlewares/zod-schema-validator.middleware'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'

class WasteCategoryHandler {
  constructor(private readonly repository: WasteCategoryRepository) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const listCategories = new ListCategoriesUseCase(this.repository)
    const entities = await listCategories.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Waste Categories retrieved successfully', entities)
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new WasteCategorySchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findCategory = new FindWasteCategoryByIDUseCase(this.repository)
    const category = await findCategory.exec(id)

    HandleHTTPResponse.OK(rep, 'Waste Category retrieved successfully', category)
  }

  async register(req: FastifyRequest<{ Body: WasteCategoryPayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterCategoriesSchema = new WasteCategorySchemaValidator(RegisterWasteCategoryDTO, req.body)
    validateRegisterCategoriesSchema.exec()

    const registerCategory = new RegisterWasteCategoryUseCase(this.repository)
    const category = await registerCategory.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Waste Category registered successfully', { id: category.id })
  }

  async update(
    req: FastifyRequest<{ Params: Record<string, string>; Body: WasteCategoryPayload }>,
    rep: FastifyReply
  ): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new WasteCategorySchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new WasteCategorySchemaValidator(UpdateWasteCategoryDTO, req.body)
    schemaValidator.exec()

    const updateCategory = new UpdateCategoryUseCase(this.repository)
    await updateCategory.exec(id, req.body)

    HandleHTTPResponse.OK(rep, 'Waste Category updated successfully', { id })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const schemaValidator = new WasteCategorySchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteCategory = new DeleteCategoryUseCase(this.repository)
    await deleteCategory.exec(id)

    HandleHTTPResponse.OK(rep, 'Waste Category deleted successfully', { id })
  }
}

export default WasteCategoryHandler
