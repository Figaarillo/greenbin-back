class ErrorEntityManagerNotFound extends Error {
  readonly code = 500
  constructor() {
    super('No `EntityManager` found in RequestContext')
    this.name = ErrorEntityManagerNotFound.name
  }
}

export default ErrorEntityManagerNotFound
