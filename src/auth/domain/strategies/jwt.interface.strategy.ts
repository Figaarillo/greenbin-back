interface IJWTStrategy {
  generateToken: (sub: string, payload: Record<string, string>, exp: string, key: string) => Promise<string>
  verifyToken: (token: string, key: string) => Promise<Record<string, string>>
}

export default IJWTStrategy
