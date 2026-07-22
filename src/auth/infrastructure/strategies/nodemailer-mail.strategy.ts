import nodemailer from 'nodemailer'
import EnvVar from '../../../shared/config/env-var.config'
import type { MailMessage } from '../../domain/strategies/mail.interface.strategy'
import type IMailStrategy from '../../domain/strategies/mail.interface.strategy'

class NodemailerMailStrategy implements IMailStrategy {
  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EnvVar.email.gmail.user,
      pass: EnvVar.email.gmail.appPassword
    }
  })

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: `"GreenBin" <${EnvVar.email.gmail.user}>`,
      ...message
    })
  }
}

export default NodemailerMailStrategy
