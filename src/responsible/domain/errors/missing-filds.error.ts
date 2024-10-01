class ErrorMissingFilds extends Error {
  constructor(fiels: string[]) {
    super(`error missing fields: ${fiels.join(', ')}`)
    this.name = 'ErrorMissingFilds'
  }
}

export default ErrorMissingFilds
