class ErrorRewardPartnerNotFound extends Error {
  constructor(id?: string, username?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      username != null ? `username: ${username}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find reward partner with ${fields.join(', ')}`
        : 'Cannot find any reward partner when try to list all reward partners'

    super(message)
    this.name = ErrorRewardPartnerNotFound.name
  }
}

export default ErrorRewardPartnerNotFound
