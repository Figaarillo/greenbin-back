import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponHandler from '../handlers/coupon.handler'

class CouponRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: CouponHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/coupon', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
      await this.handler.list(req, rep)
    })
    this.server.get(
      '/api/coupon/available',
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.listAvailables(req, rep)
      }
    )
    this.server.get('/api/coupon/:id', async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
      await this.handler.findByID(req, rep)
    })
    this.server.get('/api/coupon/populate', async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
      await this.handler.findAndPopulate(req, rep)
    })
    this.server.post('/api/coupon', async (req: FastifyRequest<{ Body: CouponPayload }>, rep) => {
      await this.handler.register(req, rep)
    })
    this.server.put(
      '/api/coupon/:id',
      async (req: FastifyRequest<{ Params: Record<string, string>; Body: CouponPayload }>, rep) => {
        await this.handler.update(req, rep)
      }
    )
    this.server.delete('/api/coupon/:id', async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
      await this.handler.delete(req, rep)
    })
  }
}

export default CouponRoute
