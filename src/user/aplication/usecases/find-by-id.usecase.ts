import type UserEntity from '@user/domain/entities/user.entity'
import ErrorUserNotFound from '@user/domain/exceptions/user-not-found.exception'
import type UserRepository from '@user/domain/repository/user.repository'

class FindUserByIDUseCase {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<UserEntity> {
    const userFound = await this.repository.Find({ id })
    if (userFound == null) {
      throw new ErrorUserNotFound(`Cannont find user with id: ${id} when get user by id`)
    }

    return userFound
  }
}

export default FindUserByIDUseCase
