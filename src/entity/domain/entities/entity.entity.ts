/* eslint-disable indent */
import { BeforeCreate, BeforeUpdate, Entity, EventArgs, Property, t } from '@mikro-orm/core'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import EntityPayload from '../payloads/entity.payload'

@Entity()
class EntityEntity extends BaseEntity {
  @Property({ unique: true })
  name: string

  @Property({ type: t.text })
  description: string

  @Property({ hidden: true, lazy: true })
  password: string

  @Property()
  city: string

  @Property()
  province: string

  constructor(payload: EntityPayload) {
    super()
    this.name = payload.name
    this.description = payload.description
    this.password = payload.password
    this.city = payload.city
    this.province = payload.province
  }

  update(description: string): void {
    if (description !== '' || description != null) this.description = description
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<EntityEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default EntityEntity
