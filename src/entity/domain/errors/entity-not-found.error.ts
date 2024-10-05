class ErrorEntityNotFound extends Error {
  constructor(id?: string, name?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      name != null ? `username: ${name}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    super(`cannot find entity with ${fields.join(', ')}`)
    this.name = ErrorEntityNotFound.name
  }
}

export default ErrorEntityNotFound
