# Propuesta 06 — Filtro Geográfico de Reward Partners

> **Prioridad sugerida:** Media
> **Esfuerzo estimado:** Bajo (1 sprint)
> **Dependencias:** Ninguna

## 1. Problema

Hoy `RewardPartner` tiene coordenadas (lat/lng), pero no hay forma de buscar comercios cercanos. Un vecino tiene que navegar toda la lista de cupones sin saber cuáles están cerca de su casa o del punto verde donde recicla.

Tener cupones de comercios lejanos reduce la tasa de canje, porque el vecino no va a cruzar toda la ciudad por un descuento.

## 2. Solución Propuesta

Endpoint que permita filtrar reward partners (y sus cupones) por cercanía geográfica, usando las coordenadas ya existentes en `RewardPartnerEntity`.

### 2.1 Funcionalidad

```typescript
// Buscar reward partners cercanos a una ubicación
GET /api/reward-partner/nearby?lat=-32.4103&lng=-63.2493&radius=5&limit=20
→ {
    partners: [
      {
        id: "uuid",
        name: "Carrefour Villa María",
        distance: 1.2,  // km
        address: "Av. Sabattini 123",
        activeCoupons: 3  // cupones disponibles actualmente
      },
      ...
    ]
  }

// Filtrar cupones por cercanía
GET /api/coupon/nearby?lat=-32.4103&lng=-63.2493&radius=3
→ Cupones de reward partners cercanos, ordenados por distancia

// También: punto de referencia puede ser un green point
GET /api/coupon/nearby-green-point/:greenPointId?radius=2
→ Cupones cerca de ese punto verde
```

### 2.2 Implementación

**Opción recomendada: Haversine en SQL con índice espacial**

PostgreSQL tiene soporte nativo para consultas geográficas. Ya que `RewardPartnerEntity` guarda coordenadas como `{latitude, longitude}`, podemos:

```sql
-- 1. Agregar columna geography (PostGIS)
-- OPCIÓN A (recomendada): Usar PostGIS para consultas precisas
SELECT id, name, address,
       ST_Distance(
         ST_MakePoint(:lng, :lat)::geography,
         ST_MakePoint(coordinates->>'longitude', coordinates->>'latitude')::geography
       ) / 1000 AS distance_km
FROM reward_partner
WHERE ST_DWithin(
        ST_MakePoint(:lng, :lat)::geography,
        ST_MakePoint(coordinates->>'longitude', coordinates->>'latitude')::geography,
        :radius_km * 1000
      )
  AND is_active = true
ORDER BY distance_km
LIMIT :limit

-- OPCIÓN B (sin PostGIS): Fórmula de Haversine en SQL
-- Menos precisa, no usa índices espaciales, pero no requiere extensión
```

**PostGIS es la solución correcta**, pero requiere instalar la extensión en PostgreSQL. Si no se quiere agregar PostGIS:

**Opción alternativa sin PostGIS:**

```typescript
// Calcular en memoria con Haversine (solo viable para conjuntos pequeños,
// ej: menos de 1000 reward partners)
class NearbyPartnersUseCase {
  async exec(lat: number, lng: number, radiusKm: number): Promise<NearbyPartner[]> {
    const allPartners = await this.repo.findAllActive()

    return allPartners
      .map(partner => ({
        ...partner,
        distance: this.haversineDistance(lat, lng, partner.coordinates.latitude, partner.coordinates.longitude)
      }))
      .filter(p => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20)
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
}
```

### 2.3 Recomendación: PostGIS

Para un sistema que va a crecer, **PostGIS es lo correcto**:

```bash
# En Docker Compose, cambiar la imagen de postgres:
# De: image: postgres:16.2
# A:  image: postgis/postgis:16-3.4

# Migración para habilitar PostGIS:
CREATE EXTENSION IF NOT EXISTS postgis;

# Agregar columna geográfica a reward_partner:
ALTER TABLE reward_partner ADD COLUMN location geography(Point, 4326);

# Poblar desde las coordenadas existentes:
UPDATE reward_partner
SET location = ST_SetSRID(ST_MakePoint(
  (coordinates->>'longitude')::float,
  (coordinates->>'latitude')::float
), 4326)::geography;

# Crear índice espacial:
CREATE INDEX idx_reward_partner_location ON reward_partner USING GIST (location);
```

**Beneficios de PostGIS:**

- Consultas eficientes con índices espaciales (GIST)
- Función `ST_DWithin` para filtrar por radio
- Función `ST_Distance` para ordenar por distancia
- Escalable a millones de puntos
- Extensible a futuro (rutas, áreas, zonas de cobertura)

### 2.4 Endpoints

```typescript
// === NUEVOS ENDPOINTS ===

// Reward partners cercanos a una ubicación
GET /api/reward-partner/nearby?lat=&lng=&radius=5&limit=20
→ partners[] with distance

// Reward partners cercanos a un green point
GET /api/reward-partner/nearby-green-point/:greenPointId?radius=5
→ partners[] with distance

// Cupones disponibles cerca de una ubicación
GET /api/coupon/nearby?lat=&lng=&radius=5
→ coupons[] with partner name and distance

// Cupones disponibles cerca de un green point
GET /api/coupon/nearby-green-point/:greenPointId?radius=5
→ coupons[] with partner name and distance

// === ENDPOINTS EXISTENTES MODIFICADOS ===

// Opcional: agregar ?lat=&lng=&radius a GET /api/reward-partner
// para que la lista normal pueda filtrarse por cercanía
```

### 2.5 Migración de Datos

```typescript
// Migración MikroORM para agregar columna location
// 1. Agregar columna location (geography) a reward_partner
// 2. Poblar desde coordinates (JSON)
// 3. Crear índice GIST

// Nota: MikroORM no soporta PostGIS nativamente, así que las queries
// geográficas se harían con raw SQL via entityManager.getConnection().execute()
```

### 2.6 Consideraciones Técnicas

1. **Precisión de coordenadas**: 6 decimales (~10cm de precisión) es suficiente para la city-scale.
2. **Radio por defecto**: 5km es un buen default para una ciudad.
3. **Cache**: Los resultados de búsqueda geográfica se pueden cachear 5-10 minutos.
4. **PostGIS vs Haversine**: PostGIS es más preciso y escalable. Haversine en memoria funciona para <1000 partners.
5. **Sin PostGIS**: Si no se quiere agregar la dependencia, se puede pre-calcular una columna `grid_cell` (cuadrícula de 1km²) para filtrar groseramente antes de aplicar Haversine.

### 2.7 Casos de Uso

```
1. Vecino abre la app → ve "Cupones cerca de tu zona" → filtra por su ubicación actual
2. Vecino entrega residuos en un green point → al recibir la notificación de puntos,
   ve "Aprovechá estos descuentos cerca del punto verde donde reciclaste"
3. Vecino busca "descuentos en alimentos" → filtra por categoría + cercanía
```

---

## 3. Integración con Otras Propuestas

- **Notificaciones (#01)**: Incluir cupones cercanos en el email de puntos ganados
- **Gamificación (#02)**: Ranking por zonas geográficas ("mejor vecino de tu barrio")
- **Timeline (#07)**: Mostrar en el timeline "Carrefour está a 800m de tu casa — canjeá tu cupón"
