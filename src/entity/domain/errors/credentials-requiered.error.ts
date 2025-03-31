class ErrorCredentialsRequired extends Error {
  public readonly code: number = 400

  constructor() {
    super('Email or name is required')
    this.name = ErrorCredentialsRequired.name
  }
}

export default ErrorCredentialsRequired
