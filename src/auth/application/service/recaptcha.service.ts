import EnvVar from '../../../shared/config/env-var.config'

interface RecaptchaResponse {
  success: boolean
  'error-codes'?: string[]
}

class RecaptchaService {
  private readonly secretKey: string

  constructor() {
    this.secretKey = EnvVar.recaptcha.secretKey
  }

  async verify(token: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') return true

    const url = 'https://www.google.com/recaptcha/api/siteverify'
    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token
    })

    const response = await fetch(url, {
      method: 'POST',
      body: params
    })

    const data = (await response.json()) as RecaptchaResponse
    return data.success
  }
}

export default RecaptchaService
