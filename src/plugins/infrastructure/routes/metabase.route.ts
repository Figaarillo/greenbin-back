import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import EnvVar from '../../../shared/config/env-var.config'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLQueryParam } from '../../../shared/utils/http.request.util'

class MetabaseRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly jwt: IJWTStrategy
  ) {}

  setup(): void {
    this.server.get('/metabase', async (req: FastifyRequest<{ Querystring: { id?: string } }>, rep: FastifyReply) => {
      const id = GetURLQueryParam(req, 'id')

      if (id === undefined || id === null || id === '') {
        HandleHTTPResponse.BadRequest(rep, 'The dashboard ID is empty or null')
      }

      const payload = {
        resourse: { dashboard: 2 },
        params: { id: [id] }
      }

      const token = await this.jwt.generateToken('metabase', payload, '1h', EnvVar.metabase.secretKey)

      const iframeURL = `http://${EnvVar.server.host}:${EnvVar.metabase.port}/embed/dashboard/${token}#bordered=true&titled=true`
      // HandleHTTPResponse.OK(rep, 'Metabase Dashboard', iframeURL)
      rep.status(200).send({ iframeURL })
    })
    this.server.get('/metabase/neighbor', async (_req: FastifyRequest, rep: FastifyReply) => {
      const payload = {
        resourse: { dashboard: 3 },
        params: {}
      }

      const token = await this.jwt.generateToken('metabase', payload, '1h', EnvVar.metabase.secretKey)

      const iframeURL = `http://${EnvVar.server.host}:${EnvVar.metabase.port}/embed/dashboard/${token}#bordered=true&titled=true`
      // HandleHTTPResponse.OK(rep, 'Metabase Dashboard', iframeURL)
      rep.status(200).send({ iframeURL })
    })
  }
}

export default MetabaseRoute
