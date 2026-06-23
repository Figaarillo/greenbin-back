/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import WasteTransactionEntity from '../../../waste-transaction/domain/entities/waste-transaction.entity'
import WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'
import WasteEntity from '../../../waste/domain/entities/waste.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

interface TransactionSeed {
  responsibleUsername: string
  neighborUsername: string
  greenPointName: string
  daysAgo: number
  details: Array<{ categoryName: string; weight: number }>
}

const TRANSACTION_SEEDS: TransactionSeed[] = [
  // malvarez_et — 8 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'malvarez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },

  // jperez_et — 6 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'jperez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },

  // rcastro_et — 10 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Electrónico', weight: 2.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'rcastro_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },

  // ngimenez_et — 5 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'ngimenez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'ngimenez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'ngimenez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'ngimenez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'ngimenez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },

  // frios_et — 12 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.8 },
      { categoryName: 'Textiles', weight: 4 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Electrónico', weight: 2.2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'frios_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Orgánico', weight: 4 },
      { categoryName: 'Papel y Cartón', weight: 1 }
    ]
  },

  // amoreno_et — 7 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'amoreno_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },

  // cvargas_et — 9 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'cvargas_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },

  // racosta_et — 11 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Electrónico', weight: 2.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.8 },
      { categoryName: 'Textiles', weight: 4 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'racosta_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },

  // lbenitez_et — 6 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'lbenitez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },

  // tibanez_et — 8 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'tibanez_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },

  // sromero_et — 5 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'sromero_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'sromero_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'sromero_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'sromero_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'sromero_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },

  // enavarro_et — 7 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'enavarro_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },

  // vpereyra_et — 10 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'vpereyra_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Electrónico', weight: 2.2 }]
  },

  // hquispe_et — 6 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'hquispe_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },

  // dfuentes_et — 9 transacciones
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Textiles', weight: 2 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [{ categoryName: 'Pilas y Baterías', weight: 2.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [{ categoryName: 'Escombros y Construcción', weight: 0.5 }]
  },
  {
    responsibleUsername: 'fmendez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Escuela Municipal',
    daysAgo: 49,
    details: [{ categoryName: 'Madera', weight: 0.8 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Barrio Los Olivos',
    daysAgo: 49,
    details: [{ categoryName: 'Aceites y Lubricantes', weight: 1.2 }]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 49,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'gsuarez_etruria',
    neighborUsername: 'dfuentes_et',
    greenPointName: 'Punto Verde Plaza San Martín',
    daysAgo: 49,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Plástico', weight: 3 },
      { categoryName: 'Vidrio', weight: 0.8 }
    ]
  },

  // emattalia — jgonzalez (13 transacciones, 43 días atrás)
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Papel y Cartón', weight: 1.5 },
      { categoryName: 'Plástico', weight: 2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Metal', weight: 0.8 },
      { categoryName: 'Vidrio', weight: 3.2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Orgánico', weight: 2.5 },
      { categoryName: 'Plástico', weight: 1.2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Papel y Cartón', weight: 4 },
      { categoryName: 'Vidrio', weight: 2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Plástico', weight: 1.8 },
      { categoryName: 'Vidrio', weight: 2.5 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Metal', weight: 1.2 },
      { categoryName: 'Papel y Cartón', weight: 3 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [{ categoryName: 'Orgánico', weight: 3 }]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Metal', weight: 1.5 },
      { categoryName: 'Plástico', weight: 2.8 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Orgánico', weight: 1.8 },
      { categoryName: 'Plástico', weight: 2.2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Orgánico', weight: 2.8 },
      { categoryName: 'Vidrio', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Papel y Cartón', weight: 2 },
      { categoryName: 'Vidrio', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [
      { categoryName: 'Metal', weight: 2 },
      { categoryName: 'Plástico', weight: 1 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 43,
    details: [{ categoryName: 'Plástico', weight: 3 }]
  },

  // emattalia — rpaez (5 transacciones, distintas fechas)
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 42,
    details: [
      { categoryName: 'Orgánico', weight: 5 },
      { categoryName: 'Papel y Cartón', weight: 2 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 42,
    details: [{ categoryName: 'Electrónico', weight: 100 }]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 13,
    details: [
      { categoryName: 'Papel y Cartón', weight: 2 },
      { categoryName: 'Pilas y Baterías', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 10,
    details: [
      { categoryName: 'Electrónico', weight: 5 },
      { categoryName: 'Papel y Cartón', weight: 10 }
    ]
  },
  {
    responsibleUsername: 'rpaez_etruria',
    neighborUsername: 'emattalia',
    greenPointName: 'Punto Verde Acceso Norte',
    daysAgo: 7,
    details: [
      { categoryName: 'Madera', weight: 3 },
      { categoryName: 'Metal', weight: 0.5 }
    ]
  }
]

function daysAgoDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

async function seedWasteTransactions(
  em: EntityManager,
  responsibles: ResponsibleEntity[],
  neighbors: NeighborEntity[],
  greenPoints: GreenPointEntity[],
  categories: WasteCategoryEntity[]
): Promise<void> {
  const existing = await em.count(WasteTransactionEntity)
  if (existing > 0) {
    console.log(`[Seeder] WasteTransaction: ya existen ${existing} registros, se omite.`)
    return
  }

  const responsibleMap = new Map(responsibles.map(r => [r.username, r]))
  const neighborMap = new Map(neighbors.map(n => [n.username, n]))
  const greenPointMap = new Map(greenPoints.map(g => [g.name, g]))
  const categoryMap = new Map(categories.map(c => [c.name, c]))

  for (const seed of TRANSACTION_SEEDS) {
    const responsible = responsibleMap.get(seed.responsibleUsername)
    const neighbor = neighborMap.get(seed.neighborUsername)
    const greenPoint = greenPointMap.get(seed.greenPointName)

    if (responsible == null) throw new Error(`[Seeder] Responsible no encontrado: ${seed.responsibleUsername}`)
    if (neighbor == null) throw new Error(`[Seeder] Neighbor no encontrado: ${seed.neighborUsername}`)
    if (greenPoint == null) throw new Error(`[Seeder] GreenPoint no encontrado: ${seed.greenPointName}`)

    const transaction = new WasteTransactionEntity(responsible, neighbor, greenPoint)
    transaction.date = daysAgoDate(seed.daysAgo)

    for (const detail of seed.details) {
      const category = categoryMap.get(detail.categoryName)
      if (category == null) throw new Error(`[Seeder] Categoría no encontrada: ${detail.categoryName}`)

      const waste = new WasteEntity(category, detail.weight, category.pointsPerWeight)
      waste.calculatePoints()
      em.persist(waste)

      const transactionDetail = new WasteTransactionDetailEntity(waste, transaction)
      transactionDetail.weight = waste.weight
      transactionDetail.setPointsPerWeight()
      transactionDetail.setPoints()
      em.persist(transactionDetail)

      transaction.addTransactionDetail(transactionDetail)
      neighbor.addPoints(transactionDetail.points)
      neighbor.registerWaste(waste)
    }

    em.persist(transaction)
  }

  await em.flush()
  console.log(`[Seeder] WasteTransaction: ${TRANSACTION_SEEDS.length} transacciones creadas con sus detalles.`)
}

export default seedWasteTransactions
