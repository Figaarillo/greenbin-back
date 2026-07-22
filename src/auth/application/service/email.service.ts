import type IMailStrategy from '../../domain/strategies/mail.interface.strategy'
import createMailStrategy from '../../infrastructure/strategies/mail-strategy.factory'

class EmailService {
  private readonly mailStrategy: IMailStrategy

  constructor(mailStrategy: IMailStrategy = createMailStrategy()) {
    this.mailStrategy = mailStrategy
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    await this.mailStrategy.send({
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

  async sendRegistrationOtp(to: string, otp: string): Promise<void> {
    await this.mailStrategy.send({
      to,
      subject: 'Verificá tu cuenta de GreenBin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Bienvenido/a! Estás a un paso de crear tu cuenta.</p>
          <p>Para verificar tu correo, ingresá este código:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4caf50; text-align: center; padding: 20px 0;">
            ${otp}
          </div>
          <p>Este código expira en <strong>10 minutos</strong>.</p>
          <p>Si no intentaste registrarte, ignorá este email.</p>
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

    await this.mailStrategy.send({
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

  async sendCouponPurchaseConfirmation(
    to: string,
    neighborName: string,
    couponTitle: string,
    code: string,
    expirationDate: Date
  ): Promise<void> {
    const formattedDate = expirationDate.toLocaleDateString('es-AR')

    await this.mailStrategy.send({
      to,
      subject: `¡Compraste "${couponTitle}"!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Hola, <strong>${neighborName}</strong>!</p>
          <p>Compraste el cupón <strong>${couponTitle}</strong>. Tu código de canje es:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4caf50; text-align: center; padding: 16px 0;">
            ${code}
          </div>
          <p>Tenés tiempo de canjearlo hasta el <strong>${formattedDate}</strong>.</p>
          <p style="color: #777; font-size: 13px;">
            Mostrá este código en el local para canjearlo.<br/>
            — El equipo de GreenBin
          </p>
        </div>
      `
    })
  }

  async sendCouponRedeemedConfirmation(to: string, neighborName: string, couponTitle: string): Promise<void> {
    await this.mailStrategy.send({
      to,
      subject: `Canjeaste "${couponTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Hola, <strong>${neighborName}</strong>!</p>
          <p>Canjeaste con éxito el cupón <strong>${couponTitle}</strong>. ¡Que lo disfrutes!</p>
          <p style="color: #777; font-size: 13px;">
            — El equipo de GreenBin
          </p>
        </div>
      `
    })
  }

  async sendCouponExpiringSoon(
    to: string,
    neighborName: string,
    couponTitle: string,
    expirationDate: Date
  ): Promise<void> {
    const formattedDate = expirationDate.toLocaleDateString('es-AR')

    await this.mailStrategy.send({
      to,
      subject: `Tu cupón "${couponTitle}" está por vencer`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Hola, <strong>${neighborName}</strong>!</p>
          <p>Tu cupón <strong>${couponTitle}</strong> vence el <strong>${formattedDate}</strong> y todavía no lo usaste.</p>
          <p style="color: #777; font-size: 13px;">
            — El equipo de GreenBin
          </p>
        </div>
      `
    })
  }

  async sendCouponCreatedConfirmation(to: string, partnerName: string, couponTitle: string): Promise<void> {
    await this.mailStrategy.send({
      to,
      subject: `Tu cupón "${couponTitle}" ya está publicado`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
          <h2 style="color: #4caf50;">GreenBin</h2>
          <p>¡Hola, <strong>${partnerName}</strong>!</p>
          <p>Tu cupón <strong>${couponTitle}</strong> fue creado y ya está disponible en el catálogo para que los vecinos lo canjeen.</p>
          <p style="color: #777; font-size: 13px;">
            — El equipo de GreenBin
          </p>
        </div>
      `
    })
  }
}

export default EmailService
