interface MailMessage {
  to: string
  subject: string
  html: string
}

interface IMailStrategy {
  send: (message: MailMessage) => Promise<void>
}

export type { MailMessage }
export default IMailStrategy
