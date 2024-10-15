class ErrorEntityNotFound extends Error {
  constructor(id?: string, name?: string, email?: string) {
    const fields = [
      id != null ? `id: ${id}` : null,
      name != null ? `username: ${name}` : null,
      email != null ? `email: ${email}` : null
    ].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find entity with ${fields.join(', ')}`
        : 'Cannot find any entity when try to list all entities find entity'

    super(message)
    this.name = ErrorEntityNotFound.name
  }
}

export default ErrorEntityNotFound
