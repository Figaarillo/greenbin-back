class ErrorRewardPartnerNotFound extends Error {
  constructor(id: string) {
    super(`Cannot update reward partner with id: ${id}`)
    this.name = ErrorRewardPartnerNotFound.name
  }
}

export default ErrorRewardPartnerNotFound
