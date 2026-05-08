import { fastify, type FastifyReply, type FastifyRequest, type FastifyInstance } from 'fastify'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true
      },
      serializers: {
        req(req: FastifyRequest) {
          return { method: req.method, url: req.url }
        },
        rep(reply: FastifyReply) {
          return { statusCode: reply.statusCode }
        }
      },
      redact: ['req.headers.authorization']
    }
  },
  production: true,
  test: false
}

class FastifyConifg {
  readonly server: FastifyInstance

  constructor(environment: 'development' | 'production' | 'test') {
    this.server = fastify({
      logger: envToLogger[environment] ?? true
    })
  }

  async start(port: number): Promise<string> {
    try {
      return await this.server.listen({
        host: '0.0.0.0',
        port
      })
    } catch (err) {
      this.server.log.error(err)
      process.exit(1)
    }
  }
}

export default FastifyConifg
