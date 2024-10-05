class ErrorRewardPartnerNotFound extends Error {
  constructor(id?: string, username?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      username != null ? `username: ${username}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    super(`cannot find reward partner with ${fields.join(', ')}`)
    this.name = ErrorRewardPartnerNotFound.name
  }
}

export default ErrorRewardPartnerNotFound
