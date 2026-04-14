import jwt from 'jsonwebtoken'
import EnvVar from '../../../shared/config/env-var.config'

interface OtpPayload {
  email: string
  otp: string
  userType: string
}

class OtpService {
  private readonly secret: string

  constructor() {
    this.secret = EnvVar.auth.accessToken
  }

  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  createToken(email: string, otp: string, userType: string): string {
    return jwt.sign({ email, otp, userType }, this.secret, { expiresIn: '10m' })
  }

  verify(token: string, enteredOtp: string): OtpPayload {
    const payload = jwt.verify(token, this.secret) as OtpPayload

    if (payload.otp !== enteredOtp) {
      throw new Error('Código OTP incorrecto')
    }

    return payload
  }
}

export default OtpService
