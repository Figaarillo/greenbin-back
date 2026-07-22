import { Resend } from 'resend'
import EnvVar from '../../../shared/config/env-var.config'
import type { MailMessage } from '../../domain/strategies/mail.interface.strategy'
import type IMailStrategy from '../../domain/strategies/mail.interface.strategy'

class ResendMailStrategy implements IMailStrategy {
  private readonly client = new Resend(EnvVar.email.resend.apiKey)

  async send(message: MailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: `GreenBin <${EnvVar.email.from}>`,
      ...message
    })

    if (error != null) {
      throw new Error(`Resend error: ${error.message}`)
    }
  }
}

export default ResendMailStrategy
