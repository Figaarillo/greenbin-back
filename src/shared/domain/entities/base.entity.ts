/* eslint-disable indent */
import { Filter, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuidv4 } from 'uuid'

// Filtro global de soft delete: se aplica por defecto a TODAS las entidades que
// extienden BaseEntity (find, findOne, list, populate y validaciones de FK).
// Para incluir registros inactivos en una lectura excepcional, desactivarlo
// puntualmente con `{ filters: { active: false } }`.
@Filter({ name: 'active', cond: { isActive: true }, default: true })
abstract class BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'isActive'

  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4()

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()

  @Property({ default: true })
  isActive: boolean = true

  softDelete(): void {
    this.isActive = false
  }

  restore(): void {
    this.isActive = true
  }
}

export default BaseEntity
