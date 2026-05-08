import nodemailer from 'nodemailer'
import EnvVar from '../../../shared/config/env-var.config'

class EmailService {
  private readonly transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EnvVar.email.user,
        pass: EnvVar.email.appPassword
      }
    })
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"GreenBin" <${EnvVar.email.user}>`,
      to,
      subject: 'Código para restablecer tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Tu código de verificación es:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4caf50; text-align: center; padding: 20px 0;">
            ${otp}
          </div>
          <p>Este código expira en <strong>10 minutos</strong>.</p>
          <p>Si no solicitaste este cambio, ignorá este email.</p>
        </div>
      `
    })
  }
}

export default EmailService
