/* eslint-disable indent */
import { BeforeCreate, BeforeUpdate, Entity, Enum, EventArgs, Property } from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import ResponsiblePayload from '../payloads/responsible.payload'
import type ResponsibleUpdatePayload from '../payloads/responsible.update.payload'
import { Roles } from '../../../auth/domain/entities/role'

@Entity()
class ResponsibleEntity extends BaseEntity {
  @Property()
  firstname: string

  @Property()
  lastname: string

  @Property({ unique: true })
  username: string

  @Property({ unique: true })
  email: string

  @Property({ hidden: true, lazy: true })
  password: string

  @Property()
  dni: number

  @Property()
  phoneNumber: string

  @Enum({ items: () => Roles })
  role: Roles

  constructor(payload: ResponsiblePayload) {
    super()
    this.firstname = payload.firstname
    this.lastname = payload.lastname
    this.username = payload.username
    this.email = payload.email
    this.password = payload.password
    this.dni = payload.dni
    this.phoneNumber = payload.phoneNumber
    this.role = Roles.RESPONSIBLE
  }

  update(payload: ResponsibleUpdatePayload): void {
    if (payload.username != null || payload.username !== '') {
      this.username = payload.username
    }
    if (payload.phoneNumber != null) {
      this.phoneNumber = payload.phoneNumber
    }
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<ResponsibleEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default ResponsibleEntity
