interface Co2ByCategory {
  categoryName: string
  totalWeight: number
  /** Kg de CO2 evitados: peso reciclado × factor CO2 de la categoría. */
  co2: number
}

interface Co2Avoided {
  totalCo2: number
  byCategory: Co2ByCategory[]
}

export type { Co2ByCategory }
export default Co2Avoided
