class ErrorEntityManagerNotFound extends Error {
  constructor() {
    super('No `EntityManager` found in RequestContext')
  }
}

export default ErrorEntityManagerNotFound
