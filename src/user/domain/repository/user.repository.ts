import type Nullable from '@shared/domain/types/nullable.type'
import type UserEntity from '../entities/user.entity'
import type UserPayload from '../payload/user.payload'

interface UserRepository {
  List: (offset: number, limit: number) => Promise<Nullable<UserEntity[]>>
  Find: (property: Record<string, string>) => Promise<Nullable<UserEntity>>
  Save: (user: UserEntity) => Promise<Nullable<UserEntity>>
  Update: (id: string, user: UserPayload) => Promise<Nullable<UserEntity>>
  Delete: (id: string) => Promise<void>
}

export default UserRepository
