interface IJWTStrategy {
  generateToken: (sub: string, payload: Record<string, any>, exp: string, key: string) => Promise<string>
  verifyToken: (token: string, key: string) => Promise<Record<string, string>>
}

export default IJWTStrategy
