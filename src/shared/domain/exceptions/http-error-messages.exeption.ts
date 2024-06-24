import type IHTTPErrorMessages from './http-error-message.interface.exeption'

const HTTPErrorMessages: Record<string, IHTTPErrorMessages> = {
  UNEXPECTED_ERROR: {
    message: 'Unexpected error',
    statusCode: 500
  }
}

export default HTTPErrorMessages
