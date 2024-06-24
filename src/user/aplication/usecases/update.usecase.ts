import type UserEntity from '@user/domain/entities/user.entity'
import ErrorUserNotFound from '@user/domain/exceptions/user-not-found.exception'
import type UserPayload from '@user/domain/payload/user.payload'
import type UserRepository from '@user/domain/repository/user.repository'

class UpdateUserUseCase {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: UserPayload): Promise<UserEntity> {
    const userUpdated = await this.repository.Update(id, payload)
    if (userUpdated == null) {
      throw new ErrorUserNotFound(`Cannot update user with id: ${id}`)
    }

    return userUpdated
  }
}

export default UpdateUserUseCase
