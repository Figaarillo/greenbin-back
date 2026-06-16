import ErrorInvalidCredentialsProvided from '../../../shared/domain/errors/invalid-credentials.error'
import ErrorMissingFields from '../../../shared/domain/errors/missing-filds.error'
import type ResponsibleEntity from '../../domain/entities/responsible.entity'
import ResponsibleRelationships from '../../domain/enums/responsible-relationships.enum'
import type ResponsibleLoginPayload from '../../domain/payloads/responsible.login.payload'
import type ResponsibleRepository from '../../domain/repositories/responsible.repository'

class LoginResponsibleUseCase {
  constructor(private readonly repository: ResponsibleRepository) {}

  async exec(payload: ResponsibleLoginPayload): Promise<ResponsibleEntity> {
    const responsible = await this.findResponsible(payload)
    if (responsible == null) {
      throw new ErrorInvalidCredentialsProvided()
    }

    const passwordValid = await responsible.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidCredentialsProvided()
    }

    return responsible
  }

  private async findResponsible(payload: ResponsibleLoginPayload): Promise<ResponsibleEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.find({ email: payload.email }, [ResponsibleRelationships.PASSWORD])
    }

    if (payload.username !== undefined && payload.username !== '') {
      return await this.repository.find({ username: payload.username }, [ResponsibleRelationships.PASSWORD])
    }

    throw new ErrorMissingFields(['email', 'username'])
  }
}

export default LoginResponsibleUseCase
