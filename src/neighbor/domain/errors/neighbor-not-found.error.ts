class ErrorNeighborNotFound extends Error {
  constructor(id?: string, username?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      username != null ? `username: ${username}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    super(`cannot find neighbor with ${fields.join(', ')}`)
    this.name = ErrorNeighborNotFound.name
  }
}

export default ErrorNeighborNotFound
