import type IJWTProvider from '../../domain/provider/jwt.interface.provider'
import jwt from 'jsonwebtoken'

class JWTProvider implements IJWTProvider {
  /**
   * @param sub - something that identifies the subject of the JWT
   * @param payload - extra data to include int the JWT that will be used to validate or identify the user
   * @param exp - expiration time for the JWT. If not provided, it will be set to 1 hour. Eg: '1h', '2d', '3m', '4y'
   * @param key - key used to sign the JWT
   * @returns JWT
   */
  async generateToken(sub: string, payload: Record<string, string>, exp: string, key: string): Promise<string> {
    return jwt.sign({ sub, ...payload }, key, { algorithm: 'HS256', expiresIn: exp === '' ? '1h' : exp })
  }

  /**
   * @param token - JWT
   * @param key - key used to sign the JWT
   * @returns payload
   */
  async verifyToken(token: string, key: string): Promise<any> {
    key = Buffer.from(key, 'base64').toString('ascii')
    jwt.verify(token, key)
  }
}

export default JWTProvider
