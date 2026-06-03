/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import { Roles } from '../../../auth/domain/entities/role'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const ADMIN_SEEDS = [
  {
    firstname: 'Super',
    lastname: 'Admin',
    username: 'superadmin',
    email: 'admin@greenbin.com',
    password: 'Admin2024!',
    dni: 99999999,
    phoneNumber: '000-000000',
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedAdmins(em: EntityManager, entities: EntityEntity[]): Promise<ResponsibleEntity[]> {
  const existing = await em.count(ResponsibleEntity, { role: Roles.ADMIN })
  if (existing > 0) {
    console.log(`[Seeder] Admin: ya existen ${existing} registros, se omite.`)
    return await em.find(ResponsibleEntity, { role: Roles.ADMIN })
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const admins = ADMIN_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    const admin = new ResponsibleEntity(data, entity)
    admin.role = Roles.ADMIN
    return admin
  })

  await em.persistAndFlush(admins)
  console.log(`[Seeder] Admin: ${admins.length} admins creados.`)
  console.log(`[Seeder] Admin credentials — email: ${ADMIN_SEEDS[0].email} | password: ${ADMIN_SEEDS[0].password}`)
  return admins
}

export default seedAdmins
