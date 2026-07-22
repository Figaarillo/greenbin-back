import EnvVar from '../../../shared/config/env-var.config'
import type IMailStrategy from '../../domain/strategies/mail.interface.strategy'
import NodemailerMailStrategy from './nodemailer-mail.strategy'
import ResendMailStrategy from './resend-mail.strategy'

// Strategy pattern: EmailService only ever talks to IMailStrategy, so swapping
// mail vendors is a one-line env change (MAIL_PROVIDER) -- no call site changes.
function createMailStrategy(): IMailStrategy {
  return EnvVar.email.provider === 'resend' ? new ResendMailStrategy() : new NodemailerMailStrategy()
}

export default createMailStrategy
