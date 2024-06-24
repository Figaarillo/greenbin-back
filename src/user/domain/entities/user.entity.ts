import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm'
import { CreateAt, Id, UpdateAt } from '../../../shared/domain/value-objects/base.value-object'
import type UserPayload from '../payload/user.payload'
import {
  City,
  Country,
  Email,
  FirstName,
  LastName,
  Password,
  PhoneNumber,
  Province,
  Role
} from '../value-objects/user.valueobject'

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn('uuid') id!: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt!: Date
  @Column() firstName!: string
  @Column() lastName!: string
  @Column({ unique: true }) email!: string
  @Column({ select: false }) password!: string
  @Column() phoneNumber!: number
  @Column() city!: string
  @Column() province!: string
  @Column() country!: string
  @Column() role!: string

  static Create(payload: UserPayload): UserEntity {
    const user = new UserEntity()

    user.id = new Id().value
    user.createdAt = new CreateAt().value
    user.updatedAt = new UpdateAt().value
    user.firstName = new FirstName(payload.firstName).value
    user.lastName = new LastName(payload.lastName).value
    user.email = new Email(payload.email).value
    user.password = new Password(payload.password).value
    user.phoneNumber = new PhoneNumber(payload.phoneNumber).value
    user.city = new City(payload.city).value
    user.province = new Province(payload.province).value
    user.country = new Country(payload.country).value
    user.role = new Role(payload.role).value

    return user
  }

  update(data: UserPayload): void {
    this.updatedAt = new UpdateAt().value
    if (data.firstName !== undefined || data.lastName !== '') {
      this.firstName = new FirstName(data.firstName).value
    }
    if (data.lastName !== undefined || data.lastName !== '') {
      this.lastName = new LastName(data.lastName).value
    }
    if (data.phoneNumber !== undefined) {
      this.phoneNumber = new PhoneNumber(data.phoneNumber).value
    }
    if (data.city !== undefined || data.city !== '') {
      this.city = new City(data.city).value
    }
    if (data.province !== undefined || data.province !== '') {
      this.province = new Province(data.province).value
    }
    if (data.country !== undefined || data.country !== '') {
      this.country = new Country(data.country).value
    }
  }
}

export default UserEntity
