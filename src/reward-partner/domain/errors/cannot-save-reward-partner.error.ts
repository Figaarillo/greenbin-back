class ErrorCannotSaveRewardPartner extends Error {
  constructor() {
    super('Cannot save a new reward partner')
    this.name = ErrorCannotSaveRewardPartner.name
  }
}

export default ErrorCannotSaveRewardPartner
