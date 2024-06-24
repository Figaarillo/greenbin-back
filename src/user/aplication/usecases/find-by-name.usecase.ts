import type UserEntity from '@user/domain/entities/user.entity'
import ErrorUserNotFound from '@user/domain/exceptions/user-not-found.exception'
import type UserRepository from '@user/domain/repository/user.repository'

class GetUserByName {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async exec(name: string): Promise<UserEntity> {
    const userFound = await this.repository.Find({ name })
    if (userFound == null) {
      throw new ErrorUserNotFound(`Cannont find user with name: ${name} when get user by name`)
    }

    return userFound
  }
}

export default GetUserByName
