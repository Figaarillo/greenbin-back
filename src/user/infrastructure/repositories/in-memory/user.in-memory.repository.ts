import type Nullable from '@shared/domain/types/nullable.type'
import type UserEntity from '@user/domain/entities/user.entity'
import type UserPayload from '@user/domain/payload/user.payload'
import type UserRepository from '@user/domain/repository/user.repository'

class UserInMemoryRepository implements UserRepository {
  private readonly userData: UserEntity[] = []

  async List(): Promise<UserEntity[]> {
    return this.userData
  }

  async GetByID(id: string): Promise<Nullable<UserEntity>> {
    const user = this.userData.find(user => user.id === id)
    if (user == null) {
      return null
    }

    return user
  }

  async getByName(name: string): Promise<Nullable<UserEntity>> {
    const user = this.userData.find(user => user.firstName === name)
    if (user == null) {
      return null
    }

    return user
  }

  async Find(property: Record<string, string>): Promise<Nullable<UserEntity>> {
    const user = this.userData.find(user => {
      return Object.entries(property).every(([key, value]) => user[key as keyof UserEntity] === value)
    })
    if (user == null) {
      return null
    }

    return user
  }

  async Save(user: UserEntity): Promise<UserEntity> {
    this.userData.push(user)

    return user
  }

  async Update(id: string, user: UserPayload): Promise<Nullable<UserEntity>> {
    const userToUpdate = this.userData.find(user => {
      if (user.id === id) {
        return user
      }

      return user
    })

    if (userToUpdate == null) {
      return null
    }

    userToUpdate.update(user)

    return userToUpdate
  }

  async Delete(id: string): Promise<void> {
    const indexToDelete = this.userData.findIndex(entity => entity.id === id)

    if (indexToDelete === -1) {
      throw new Error('User not found')
    }

    this.userData.splice(indexToDelete, 1)
  }
}

export default UserInMemoryRepository
