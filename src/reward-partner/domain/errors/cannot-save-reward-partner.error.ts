class ErrorCannotSaveRewardPartner extends Error {
  readonly code: number = 400

  constructor() {
    super('Cannot save a new reward partner')
    this.name = ErrorCannotSaveRewardPartner.name
  }
}

export default ErrorCannotSaveRewardPartner
