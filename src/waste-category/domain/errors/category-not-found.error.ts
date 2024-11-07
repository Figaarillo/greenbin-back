class ErrorCategoryNotFound extends Error {
  constructor(id?: string, name?: string) {
    const fields = [id != null ? `id: ${id}` : null, name != null ? `name: ${name}` : null].filter(Boolean)

    const message =
      fields.length > 0
        ? `Cannot find category with ${fields.join(', ')}`
        : 'Cannot find any category when try to list all entities find entity'

    super(message)
    this.name = ErrorCategoryNotFound.name
  }
}

export default ErrorCategoryNotFound
