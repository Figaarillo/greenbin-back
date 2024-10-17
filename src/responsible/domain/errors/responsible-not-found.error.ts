class ErrorResponsibleNotFound extends Error {
  constructor(id?: string, username?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      username != null ? `username: ${username}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find responsible with ${fields.join(', ')}`
        : 'Cannot find any responsible when try to list all responsibles'

    super(message)
    this.name = ErrorResponsibleNotFound.name
  }
}

export default ErrorResponsibleNotFound
