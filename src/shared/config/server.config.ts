import * as dotenv from 'dotenv'

abstract class ConfigServer {
  constructor() {
    const nodeEnvPath = this.createPathToEnvFile(this.getNodeEnv())
    dotenv.config({
      path: nodeEnvPath
    })
  }

  getEnviroment(key: string): string | undefined {
    return process.env[key.toUpperCase()]
  }

  getNumberEnviroment(key: string): number | undefined {
    return Number(this.getEnviroment(key))
  }

  getNodeEnv(): string {
    return this.getEnviroment('NODE_ENV')?.trim() ?? ''
  }

  createPathToEnvFile(path: string): string {
    const ENV: string = '.env'

    if (path.length > 0) {
      return `${ENV}.${path}`
    }

    return ENV
  }
}

export default ConfigServer
