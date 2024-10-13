import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type GreenPointHandler from '../handler/green-point.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/green-point.swagger-schema'

class GreenPointRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: GreenPointHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/green-point',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.list(req, res)
      }
    )
    this.server.get(
      '/api/green-point',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
    this.server.post('/api/green-point', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.server.put(
      '/api/green-point/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.server.delete(
      '/api/green-point/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.delete(req, res)
      }
    )
  }
}

export default GreenPointRoute
