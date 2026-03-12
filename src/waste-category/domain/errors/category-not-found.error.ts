class ErrorCategoryNotFound extends Error {
  readonly code: number = 404

  constructor(id?: string, name?: string) {
    const fields = [id != null ? `id: ${id}` : null, name != null ? `name: ${name}` : null].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find category with ${fields.join(', ')}`
        : 'Cannot find any category when try to list all categories'

    super(message)
    this.name = ErrorCategoryNotFound.name
  }
}

export default ErrorCategoryNotFound
