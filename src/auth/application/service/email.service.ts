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

  async sendWasteDeliveryConfirmation(
    to: string,
    neighborName: string,
    wastes: Array<{ categoryName: string; weight: number }>
  ): Promise<void> {
    const rows = wastes
      .map(w => {
        const weight = w.weight.toFixed(2)
        return `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e0e0e0;">${w.categoryName}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e0e0e0; text-align: right;">${weight} kg</td>
        </tr>`
      })
      .join('')

    await this.transporter.sendMail({
      from: `"GreenBin" <${EnvVar.email.user}>`,
      to,
      subject: '¡Entrega de residuos registrada con éxito!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Hola, <strong>${neighborName}</strong>!</p>
          <p>
            Queremos informarte que tu entrega de residuos ha sido registrada correctamente en nuestro sistema.
            Gracias por contribuir a un ambiente más limpio y sostenible.
          </p>
          <p>A continuación encontrás el detalle de los residuos entregados:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background-color: #4caf50; color: #fff;">
                <th style="padding: 10px 14px; text-align: left;">Categoría</th>
                <th style="padding: 10px 14px; text-align: right;">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <p>Los puntos correspondientes ya fueron acreditados en tu cuenta.</p>
          <p style="color: #777; font-size: 13px;">
            Si tenés alguna consulta, no dudes en contactarnos.<br/>
            — El equipo de GreenBin
          </p>
        </div>
      `
    })
  }
}

export default EmailService
