class ErrorNotificationNotFound extends Error {
  readonly code: number = 404

  constructor() {
    super('Cannot find notification')
    this.name = ErrorNotificationNotFound.name
  }
}

export default ErrorNotificationNotFound
