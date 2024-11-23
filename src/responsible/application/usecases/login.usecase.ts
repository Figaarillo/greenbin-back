import ErrorInvalidPassword from '../../../neighbor/domain/errors/invalid-password.error'
import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ErrorMissingFilds from '../../domain/errors/missing-filds.error'
import ErrorResponsibleNotFound from '../../domain/errors/responsible-not-found.error'
import type ResponsibleLoginPayload from '../../domain/payloads/responsible.login.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class LoginResponsibleUseCase {
  constructor(private readonly repository: ResponsibleRepository) {
    this.repository = repository
  }

  async exec(payload: ResponsibleLoginPayload): Promise<ResponsibleEntity> {
    const responsible = await this.findResponsible(payload)
    if (responsible == null) {
      throw new ErrorResponsibleNotFound(undefined, payload.email, payload.username)
    }

    const passwordValid = await responsible.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidPassword()
    }

    return responsible
  }

  private async findResponsible(payload: ResponsibleLoginPayload): Promise<ResponsibleEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.findWithPassword({ email: payload.email })
    }

    if (payload.username !== undefined && payload.username !== '') {
      return await this.repository.findWithPassword({ username: payload.username })
    }

    throw new ErrorMissingFilds(['email', 'username'])
  }
}

export default LoginResponsibleUseCase
