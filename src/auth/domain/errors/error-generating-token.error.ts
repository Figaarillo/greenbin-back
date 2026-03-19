class ErrorGeneratingToken extends Error {
  constructor(type: 'access' | 'refresh') {
    super(`Error generating ${type} token`)
    this.name = ErrorGeneratingToken.name
  }
}

export default ErrorGeneratingToken
