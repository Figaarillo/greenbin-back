class ErrorGreenPointNotFound extends Error {
  constructor(id?: string, name?: string) {
    const fields = [id != null ? `id: ${id}` : null, name != null ? `username: ${name}` : null].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find entity with ${fields.join(', ')}`
        : 'Cannot find any green point when try to list all entities find entity'

    super(message)
    this.name = ErrorGreenPointNotFound.name
  }
}

export default ErrorGreenPointNotFound
