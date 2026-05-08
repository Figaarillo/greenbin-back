/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const REWARD_PARTNER_SEEDS = [
  {
    name: 'Supermercado Carrefour Villa María',
    username: 'carrefour_vm',
    address: 'Av. Eduardo Varela 2800, Villa María',
    cuit: '30-69345023-1',
    email: 'canje@carrefour-vm.com.ar',
    password: 'Partner2024!',
    phoneNumber: '353-4555001',
    coordinates: { latitude: -32.405, longitude: -63.238 },
    entityId: '',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    name: 'Farmacia Del Pueblo',
    username: 'farmacia_delpueblo',
    address: 'Bv. Sarmiento 1045, Villa María',
    cuit: '20-18765432-9',
    email: 'canje@farmaciadelpueblo.com.ar',
    password: 'Partner2024!',
    phoneNumber: '353-4555002',
    coordinates: { latitude: -32.412, longitude: -63.24 },
    entityId: '',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    name: 'Librería El Estudiante',
    username: 'libreria_estudiante',
    address: 'Calle 9 de Julio 234, Córdoba',
    cuit: '27-22334455-6',
    email: 'canje@elestudiante.com.ar',
    password: 'Partner2024!',
    phoneNumber: '351-4600001',
    coordinates: { latitude: -31.415, longitude: -64.185 },
    entityId: '',
    entityEmail: 'contacto@ecoverde.org.ar'
  }
]

async function seedRewardPartners(em: EntityManager, entities: EntityEntity[]): Promise<RewardPartnerEntity[]> {
  const existing = await em.count(RewardPartnerEntity)
  if (existing > 0) {
    console.log(`[Seeder] RewardPartner: ya existen ${existing} registros, se omite.`)
    return await em.find(RewardPartnerEntity, {})
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const partners = REWARD_PARTNER_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new RewardPartnerEntity(data, entity)
  })

  await em.persistAndFlush(partners)
  console.log(`[Seeder] RewardPartner: ${partners.length} reward partners creados.`)
  return partners
}

export default seedRewardPartners
