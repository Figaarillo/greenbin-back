import { type FastifyError } from 'fastify'

class ErrorFactory {
  private readonly _message: string
  private readonly _code: number
  private readonly _stack: string

  private constructor(error: FastifyError) {
    this._message = error.message
    this._code = error.statusCode ?? 400
    this._stack = error.stack ?? ''
  }

  static create(error: FastifyError): ErrorFactory {
    return new ErrorFactory(error)
  }

  get message(): string {
    return this._message
  }

  get code(): number {
    return this._code
  }

  get stack(): string {
    return this._stack
      .split('\n') // Dividir en líneas
      .map(line => line.trim()) // Eliminar espacios innecesarios
      .filter(line => line.length > 0 && !line.includes('node_modules')) // Filtrar líneas que provengan de node_modules
      .map(line => {
        // Reemplazar la ruta absoluta hasta `dist/` para acortarla
        const match = line.match(/\/dist\/.*/)
        return match != null ? `at ${match[0]}` : line
      })
      .join('\n') // Volver a unir en un string
  }
}

export default ErrorFactory
