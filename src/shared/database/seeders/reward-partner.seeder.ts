/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const REWARD_PARTNER_SEEDS = [
  {
    name: 'Almacén Don Juan',
    username: 'alm_donjuan',
    address: 'Av. San Martín 150, Etruria',
    cuit: '20-15432678-3',
    email: 'canje@almacendonjuan.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3465-420001',
    coordinates: { latitude: -32.9332, longitude: -62.5847 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Ferretería El Progreso',
    username: 'ferr_progreso',
    address: 'Calle Rivadavia 320, Etruria',
    cuit: '30-72345678-9',
    email: 'canje@ferreteriaelprogreso.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3465-420002',
    coordinates: { latitude: -32.934, longitude: -62.5835 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Farmacia San Roque',
    username: 'farm_sanroque',
    address: 'Bv. Independencia 88, Etruria',
    cuit: '27-32145678-5',
    email: 'canje@farmaciasanroque.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3465-420003',
    coordinates: { latitude: -32.9325, longitude: -62.5852 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Panadería La Espiga',
    username: 'pan_laespiga',
    address: 'Calle 9 de Julio 210, Etruria',
    cuit: '23-28765432-4',
    email: 'canje@panaderiallaespiga.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3465-420004',
    coordinates: { latitude: -32.9318, longitude: -62.5838 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Almacén El Progreso',
    username: 'almacen_elprogreso',
    address: 'Calle Belgrano 345, Etruria',
    cuit: '20-25678901-3',
    email: 'canje@almacenelprogreso.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3533-400010',
    coordinates: { latitude: -32.948, longitude: -63.254 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
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
