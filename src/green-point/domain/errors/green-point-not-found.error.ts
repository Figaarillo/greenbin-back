class ErrorGreenPointNotFound extends Error {
  readonly code: number = 404

  constructor(id?: string, name?: string) {
    const fields = [id != null ? `id: ${id}` : null, name != null ? `username: ${name}` : null].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find green point with ${fields.join(', ')}`
        : 'Cannot find any green point when try to list all green poitns find entity'

    super(message)
    this.name = ErrorGreenPointNotFound.name
  }
}

export default ErrorGreenPointNotFound
