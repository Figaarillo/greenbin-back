import Fastify, { type FastifyInstance } from 'fastify'

class FastifyConifg {
  constructor(
    readonly server = Fastify({
      logger: true
    })
  ) {}

  instance(): FastifyInstance {
    return this.server
  }

  async start(): Promise<void> {
    try {
      await this.server.listen({
        host: '0.0.0.0',
        port: parseInt(process.env.PORT ?? '5000')
      })
    } catch (err) {
      this.server.log.error(err)
      process.exit(1)
    }
  }
}

export default FastifyConifg
