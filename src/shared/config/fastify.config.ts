import Fastify from 'fastify'

class FastifyConifg {
  constructor(
    readonly server = Fastify({
      logger: true
    })
  ) {}

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
