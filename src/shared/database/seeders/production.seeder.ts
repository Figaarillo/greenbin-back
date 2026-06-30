import { RequestContext } from '@mikro-orm/core'
import { type EntityManager } from '@mikro-orm/postgresql'
import EntityEntity from '../../../entity/domain/entities/entity.entity'
import EntityMikroORMRepository from '../../../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import ResponsibleMikroORMRepository from '../../../responsible/infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import { Roles } from '../../../auth/domain/entities/role'
import EnvVar from '../../config/env-var.config'

async function seedProduction(em: EntityManager): Promise<void> {
  await RequestContext.create(em.fork(), async () => {
    const entityRepo = new EntityMikroORMRepository()
    const responsibleRepo = new ResponsibleMikroORMRepository()

    let entity = await entityRepo.find({})

    if (entity == null) {
      entity = new EntityEntity({
        name: EnvVar.prodEntity.name,
        email: EnvVar.prodEntity.email,
        description: EnvVar.prodEntity.description,
        password: EnvVar.prodEntity.password,
        city: EnvVar.prodEntity.city,
        province: EnvVar.prodEntity.province,
        coordinates: {
          latitude: EnvVar.prodEntity.latitude,
          longitude: EnvVar.prodEntity.longitude
        }
      })

      await entityRepo.save(entity)
    }

    const existingAdmin = await responsibleRepo.find({ role: Roles.ADMIN })

    if (existingAdmin == null) {
      const admin = new ResponsibleEntity(
        {
          firstname: 'Super',
          lastname: 'Admin',
          username: 'superadmin',
          email: EnvVar.admin.email,
          password: EnvVar.admin.password,
          dni: 99999999,
          phoneNumber: '000-000000',
          entityId: entity.id
        },
        entity
      )
      admin.role = Roles.ADMIN
      await responsibleRepo.save(admin)
    }
  })
}

export default seedProduction
