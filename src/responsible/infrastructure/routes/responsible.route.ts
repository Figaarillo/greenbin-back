import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type ResponsibleHandler from '../handler/responsible.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schema/responsible.swagger-schema'

class ResponsibleRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: ResponsibleHandler
  ) {}

  setupRoutes(): void {
    this.router.get(
      '/api/responsible',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.List(req, res)
      }
    )
    this.router.get(
      '/api/responsible/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.FindByID(req, res)
      }
    )
    this.router.post('/api/responsible', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.router.put(
      '/api/responsible/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.Update(req, res)
      }
    )
    this.router.delete(
      '/api/responsible/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.Delete(req, res)
      }
    )
  }
}

export default ResponsibleRoute
