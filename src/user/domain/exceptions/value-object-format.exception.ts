class ErrorValueObjectFormat extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValueObjectFormatException'
  }
}

export default ErrorValueObjectFormat
