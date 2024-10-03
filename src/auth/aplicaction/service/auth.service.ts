import EnvVar from '../../../shared/config/env-var.config'
import ErrorGeneratingToken from '../../domain/errors/error-generating-token.error'
import type IJWTProvider from '../../domain/providers/jwt.interface.provider'

class AuthService {
  private readonly ACCESS_TOKEN = EnvVar.auth.accessToken
  private readonly REFRESH_TOKEN = EnvVar.auth.refreshToken
  private readonly ACCESS_TOKEN_EXPIRES_IN = EnvVar.auth.accessTokenExpiresIn
  private readonly REFRESH_TOKEN_EXPIRES_IN = EnvVar.auth.refreshTokenExpiresIn

  constructor(readonly jwtProvider: IJWTProvider) {}

  async generateAccessToken(id: string, credential: Record<string, string>): Promise<string> {
    const jwt = await this.jwtProvider.generateToken(
      id,
      { ...credential, type: 'access' },
      this.ACCESS_TOKEN_EXPIRES_IN,
      this.ACCESS_TOKEN
    )
    if (jwt === '') throw new ErrorGeneratingToken('access')
    return jwt
  }

  async generateRefreshToken(id: string, credential: Record<string, string>): Promise<string> {
    const jwt = await this.jwtProvider.generateToken(
      id,
      { ...credential, type: 'refresh' },
      this.REFRESH_TOKEN_EXPIRES_IN,
      this.REFRESH_TOKEN
    )
    if (jwt === '') throw new ErrorGeneratingToken('refresh')
    return jwt
  }

  async verifyAccessToken(token: string): Promise<Record<string, string>> {
    return await this.jwtProvider.verifyToken(token, this.ACCESS_TOKEN)
  }

  async verifyRefreshToken(token: string): Promise<Record<string, string>> {
    return await this.jwtProvider.verifyToken(token, this.REFRESH_TOKEN)
  }
}

export default AuthService
