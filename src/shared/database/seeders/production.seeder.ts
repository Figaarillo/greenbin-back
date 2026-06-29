/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import EntityEntity from '../../../entity/domain/entities/entity.entity'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import { Roles } from '../../../auth/domain/entities/role'
import EnvVar from '../../config/env-var.config'

/**
 * Production bootstrap seeder.
 *
 * Crea la entidad inicial y el superadmin cuando la base está vacía.
 * Solo corre en producción (y solo una vez, porque es idempotente).
 *
 * Flujo:
 *   1. Si no existe ninguna entidad → crea una con datos de env vars (o defaults)
 *   2. Si no existe ningún admin → crea un Responsible con role ADMIN
 *
 * El admin usa ADMIN_EMAIL / ADMIN_PASSWORD del environment, obligatorios.
 * La entidad usa PROD_ENTITY_* vars con defaults sensibles.
 */
async function seedProduction(em: EntityManager): Promise<void> {
  const start = Date.now()
  console.log('\n🚀 Inicializando bootstrap de producción...\n')

  try {
    // ── 1. Entity ──────────────────────────────────────────────────────
    let entity: EntityEntity | null = null
    const entityCount = await em.count(EntityEntity)

    if (entityCount === 0) {
      entity = new EntityEntity({
        name: EnvVar.prodEntity.name,
        email: EnvVar.prodEntity.email,
        description: EnvVar.prodEntity.description,
        password: EnvVar.admin.password,
        city: EnvVar.prodEntity.city,
        province: EnvVar.prodEntity.province,
        coordinates: {
          latitude: EnvVar.prodEntity.latitude,
          longitude: EnvVar.prodEntity.longitude
        }
      })

      await em.persistAndFlush(entity)
      console.log(`[Bootstrap] Entidad creada: "${entity.name}" (${entity.email})`)
    } else {
      console.log(`[Bootstrap] Entidad: ya existen ${entityCount} registros, se omite.`)
    }

    // ── 2. Admin (Responsible + role ADMIN) ────────────────────────────
    const adminCount = await em.count(ResponsibleEntity, { role: Roles.ADMIN })

    if (adminCount === 0) {
      // Necesitamos la entidad de referencia
      if (entity == null) {
        entity = await em.findOneOrFail(EntityEntity, {})
      }

      const admin = new ResponsibleEntity(
        {
          firstname: 'Super',
          lastname: 'Admin',
          username: 'superadmin',
          email: EnvVar.admin.email,
        password: EnvVar.prodEntity.password,
          dni: 99999999,
          phoneNumber: '000-000000',
          entityId: entity.id
        },
        entity
      )
      admin.role = Roles.ADMIN

      await em.persistAndFlush(admin)
      console.log(`[Bootstrap] Admin creado: "${admin.username}" (${admin.email})`)
    } else {
      console.log(`[Bootstrap] Admin: ya existen ${adminCount} registros, se omite.`)
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(2)
    console.log(`\n✅ Bootstrap de producción completado en ${elapsed}s\n`)
  } catch (err) {
    console.error('\n❌ Error durante bootstrap de producción:', err)
    throw err
  }
}

export default seedProduction
