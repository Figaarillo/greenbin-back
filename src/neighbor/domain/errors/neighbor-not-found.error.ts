class ErrorNeighborNotFound extends Error {
  constructor(id?: string, username?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      username != null ? `username: ${username}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find neighbor with ${fields.join(', ')}`
        : 'Cannot find any neighbor when try to list all neighbors'

    super(message)
    this.name = ErrorNeighborNotFound.name
  }
}

export default ErrorNeighborNotFound
