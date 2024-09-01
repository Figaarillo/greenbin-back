/* eslint-disable indent */
import { BeforeCreate, BeforeUpdate, Entity, EventArgs, Property } from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import NeighborPayload from '../payloads/neighbor.payload'

@Entity()
class NeighborEntity extends BaseEntity {
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
  birthdate: Date

  @Property()
  phoneNumber: string

  @Property({ default: 0 })
  points: number

  constructor(payload: NeighborPayload) {
    super()
    this.firstname = payload.firstname
    this.lastname = payload.lastname
    this.username = payload.username
    this.email = payload.email
    this.password = payload.password
    this.dni = payload.dni
    this.birthdate = payload.birthdate
    this.phoneNumber = payload.phoneNumber
    this.points = 0
  }

  addPoints(points: number): void {
    this.points += points
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<NeighborEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default NeighborEntity
