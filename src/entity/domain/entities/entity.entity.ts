import { CreateAt, Id, UpdateAt } from '@shared/domain/value-objects/base.value-object'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import type EntityPayload from '../payloads/entity.payload'

@Entity()
class EntityEntity {
  @PrimaryGeneratedColumn('uuid') id!: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt!: Date
  @Column({ unique: true }) name!: string
  @Column() description!: string
  @Column({ select: false }) password!: string
  @Column() city!: string
  @Column() province!: string

  static Create(payload: EntityPayload): EntityEntity {
    const entity = new EntityEntity()

    entity.id = new Id().value
    entity.createdAt = new CreateAt().value
    entity.updatedAt = new UpdateAt().value
    entity.name = payload.description
    entity.description = payload.description
    entity.password = payload.password
    entity.city = payload.city
    entity.province = payload.province

    return entity
  }

  update(payload: EntityPayload): void {
    this.updatedAt = new UpdateAt().value
    if (payload.description !== undefined || payload.description !== '') {
      this.name = payload.description
    }
  }
}

export default EntityEntity
