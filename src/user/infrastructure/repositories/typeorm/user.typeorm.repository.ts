import type Nullable from '@shared/domain/types/nullable.type'
import UserEntity from '@user/domain/entities/user.entity'
import type UserPayload from '@user/domain/payload/user.payload'
import type UserRepository from '@user/domain/repository/user.repository'
import { type DataSource, type Repository } from 'typeorm'

class UserTypeormRepository implements UserRepository {
  private readonly repository: Repository<UserEntity>

  constructor(private readonly db: DataSource) {
    this.repository = this.initRepository()
  }

  private initRepository(): Repository<UserEntity> {
    const getConnect = this.db

    return getConnect.getRepository(UserEntity)
  }

  async List(offset: number, limit: number): Promise<Nullable<UserEntity[]>> {
    const repository = this.repository

    return await repository.find({
      skip: offset,
      take: limit,
      cache: 10000
    })
  }

  async Find(property: Record<string, string>): Promise<Nullable<UserEntity>> {
    const user = await this.repository.findOne({
      where: { ...property },
      cache: 10000
    })

    return user
  }

  async Save(user: UserEntity): Promise<Nullable<UserEntity>> {
    const repository = this.repository

    return await repository.save(user)
  }

  async Update(id: string, userPayload: UserPayload): Promise<Nullable<UserEntity>> {
    const user = await this.repository.findOne({ where: { id } })
    if (user == null) {
      return null
    }

    user.update(userPayload)

    return await this.repository.save(user)
  }

  async Delete(id: string): Promise<void> {
    await this.repository.delete({ id })
  }
}

export default UserTypeormRepository
