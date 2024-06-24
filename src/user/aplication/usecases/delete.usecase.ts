import type UserRepository from '@user/domain/repository/user.repository'

class DeleteUser {
  constructor(private readonly repository: UserRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<void> {
    await this.repository.Delete(id)
  }
}

export default DeleteUser
