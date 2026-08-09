import ErrorInvalidDateRange from '../domain/errors/invalid-date-range.error'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Los filtros de estadísticas reciben fechas de calendario (`YYYY-MM-DD`) desde
 * los selectores del dashboard. `new Date('2026-08-04')` las interpreta como
 * medianoche UTC, así que usar ese valor tal cual como cota superior descarta
 * todo lo ocurrido durante ese día — incluida la entrega que el usuario acaba
 * de registrar. Por eso una fecha sin hora se expande al día completo:
 * `from` al inicio del día y `to` al final, en la zona horaria del servidor.
 *
 * Los timestamps ISO completos se respetan sin tocar: el front manda instantes
 * exactos ya resueltos en la zona del usuario, y ahí no hay nada que inferir.
 */
function parseBoundary(param: string, value: string | undefined, endOfDay: boolean): Date | undefined {
  if (value == null || value.trim() === '') return undefined

  const raw = value.trim()

  if (DATE_ONLY.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number)
    const date = endOfDay ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day, 0, 0, 0, 0)
    if (Number.isNaN(date.getTime()) || date.getMonth() !== month - 1) {
      throw new ErrorInvalidDateRange(param, raw)
    }
    return date
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) throw new ErrorInvalidDateRange(param, raw)
  return parsed
}

export function parseRangeStart(value?: string): Date | undefined {
  return parseBoundary('from', value, false)
}

export function parseRangeEnd(value?: string): Date | undefined {
  return parseBoundary('to', value, true)
}
