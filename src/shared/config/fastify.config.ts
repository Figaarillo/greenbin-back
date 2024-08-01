import { fastify, type FastifyInstance } from 'fastify'

class FastifyConifg {
  readonly server: FastifyInstance

  constructor(logger?: boolean) {
    this.server = fastify({
      logger: logger ?? false
    })
  }

  async start(port: number): Promise<string> {
    try {
      return await this.server.listen({
        host: '127.0.0.1',
        port
      })
    } catch (err) {
      this.server.log.error(err)
      process.exit(1)
    }
  }
}

export default FastifyConifg
