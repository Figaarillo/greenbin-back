import UserEntity from '@user/domain/entities/user.entity'
import type UserPayload from '@user/domain/payload/user.payload'
import type UserRepository from '@user/domain/repository/user.repository'

class SaveUserUseCase {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async exec(payload: UserPayload): Promise<UserEntity> {
    const newUser = UserEntity.Create(payload)

    const user = await this.repository.Save(newUser)
    if (user == null) {
      throw new Error('Cannot save user')
    }

    return user
  }
}

export default SaveUserUseCase
