class ErrorRewardPartnerSchemaValidation extends Error {
  constructor(message: string) {
    super(message)
    this.name = ErrorRewardPartnerSchemaValidation.name
  }
}

export default ErrorRewardPartnerSchemaValidation
