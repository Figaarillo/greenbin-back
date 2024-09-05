import type IJWTProvider from '../../domain/provider/jwt.interface.provider'

class AuthService {
  constructor(readonly jwtProvider: IJWTProvider) {}

  async generateAccessToken(id: string, credential: Record<string, string>): Promise<string> {
    const jwt = await this.jwtProvider.generateToken(id, credential, '10m', 'key')
    if (jwt === '') throw new Error('Error generating access token')
    return jwt
  }

  async generateRefreshToken(id: string, credential: Record<string, string>): Promise<string> {
    const jwt = await this.jwtProvider.generateToken(id, credential, '7d', 'key')
    if (jwt === '') throw new Error('Error generating refresh token')
    return jwt
  }

  async verifyAccessToken(token: string): Promise<any> {
    return await this.jwtProvider.verifyToken(token, 'key')
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return await this.jwtProvider.verifyToken(token, 'key')
  }
}
export default AuthService
