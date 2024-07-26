/* eslint-disable indent */
import { BaseEntity, BeforeCreate, BeforeUpdate, Entity, EventArgs, Property, t } from '@mikro-orm/core'
import { hash, verify } from 'argon2'
import ResponsiblePayload from '../payloads/responsible.payload'

@Entity()
class ResponsibleResponsible extends BaseEntity {
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
  phoneNumber: number

  constructor(payload: ResponsiblePayload) {
    super()
    this.firstname = payload.firstname
    this.lastname = payload.lastname
    this.username = payload.username
    this.email = payload.email
    this.password = payload.password
    this.dni = payload.dni
    this.phoneNumber = payload.phoneNumber
  }

  update(username: string, phoneNumber: number): void {
    if (username != null || username !== '') {
      this.username = username
    }
    if (phoneNumber != null) {
      this.phoneNumber = phoneNumber
    }
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<ResponsibleResponsible>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default ResponsibleResponsible
