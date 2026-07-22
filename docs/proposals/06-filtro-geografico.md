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
→ partners[] with distance   █ 󰋜                                                         12:12󱑂 
 🞈  ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp1s0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether e8:80:88:6a:14:7d brd ff:ff:ff:ff:ff:ff
3: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:cb:6f:6b brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
4: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether bc:f4:d4:ad:db:61 brd ff:ff:ff:ff:ff:ff
    inet 10.10.3.142/24 brd 10.10.3.255 scope global dynamic noprefixroute wlp2s0
       valid_lft 509sec preferred_lft 509sec
    inet6 fe80::e597:dd92:2fe6:1d64/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
5: br-d9754932cc6b: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 72:d4:ab:78:af:0d brd ff:ff:ff:ff:ff:ff
    inet 172.24.0.1/16 brd 172.24.255.255 scope global br-d9754932cc6b
       valid_lft forever preferred_lft forever
6: br-2f5f2bb27c03: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether d2:24:da:4d:f7:a5 brd ff:ff:ff:ff:ff:ff
    inet 172.22.0.1/16 brd 172.22.255.255 scope global br-2f5f2bb27c03
       valid_lft forever preferred_lft forever
7: br-3439f732d074: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether b6:06:2b:e4:14:be brd ff:ff:ff:ff:ff:ff
    inet 172.19.0.1/16 brd 172.19.255.255 scope global br-3439f732d074
       valid_lft forever preferred_lft forever
8: br-3da2bba1527d: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether ea:88:25:2b:ca:a5 brd ff:ff:ff:ff:ff:ff
    inet 172.23.0.1/16 brd 172.23.255.255 scope global br-3da2bba1527d
       valid_lft forever preferred_lft forever
9: docker_gwbridge: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 6a:2f:ba:21:64:51 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global docker_gwbridge
       valid_lft forever preferred_lft forever
10: br-a9a2952b6696: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 9a:8f:e1:da:74:c5 brd ff:ff:ff:ff:ff:ff
    inet 172.21.0.1/16 brd 172.21.255.255 scope global br-a9a2952b6696
       valid_lft forever preferred_lft forever
11: br-aef1d6ce86ca: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 9a:22:99:5e:16:eb brd ff:ff:ff:ff:ff:ff
    inet 172.25.0.1/16 brd 172.25.255.255 scope global br-aef1d6ce86ca
       valid_lft forever preferred_lft forever
12: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 1a:79:d3:67:40:d2 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
16: br-4cbd8eedd240: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 7a:0c:7f:74:dc:3b brd ff:ff:ff:ff:ff:ff
    inet 172.20.0.1/16 brd 172.20.255.255 scope global br-4cbd8eedd240
       valid_lft forever preferred_lft forever
    inet6 fe80::780c:7fff:fe74:dc3b/64 scope link
       valid_lft forever preferred_lft forever
17: vethfbbb123@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-4cbd8eedd240 state UP group default
    link/ether 22:77:1e:94:bf:50 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::2077:1eff:fe94:bf50/64 scope link
       valid_lft forever preferred_lft forever
18: tun0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UNKNOWN group default qlen 500
    link/none
    inet 10.10.4.165/24 brd 10.10.4.255 scope global noprefixroute tun0
       valid_lft forever preferred_lft forever
    inet6 fe80::c34f:123c:5bed:8ba7/64 scope link stable-privacy
       valid_lft forever preferred_lft forever

   █ 󰋜                                                                                                                                                                       12:13󱑂 
 🞈  ip route
default via 10.10.3.1 dev wlp2s0 proto dhcp metric 600
10.10.1.0/24 via 10.10.4.1 dev tun0 proto static metric 50
10.10.2.0/24 via 10.10.4.1 dev tun0 proto static metric 50
10.10.3.0/24 dev wlp2s0 proto kernel scope link src 10.10.3.142 metric 600
10.10.3.1 dev wlp2s0 proto static scope link metric 50
10.10.4.0/24 dev tun0 proto kernel scope link src 10.10.4.165 metric 50
10.10.7.0/24 via 10.10.4.1 dev tun0 proto static metric 50
10.48.0.0/13 via 10.10.4.1 dev tun0 proto static metric 50
169.254.0.0/16 dev virbr0 scope link metric 1000 linkdown
172.16.1.0/24 via 10.10.4.1 dev tun0 proto static metric 50
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown
172.18.0.0/16 dev docker_gwbridge proto kernel scope link src 172.18.0.1 linkdown
172.19.0.0/16 dev br-3439f732d074 proto kernel scope link src 172.19.0.1 linkdown
172.20.0.0/16 dev br-4cbd8eedd240 proto kernel scope link src 172.20.0.1
172.21.0.0/16 dev br-a9a2952b6696 proto kernel scope link src 172.21.0.1 linkdown
172.22.0.0/16 dev br-2f5f2bb27c03 proto kernel scope link src 172.22.0.1 linkdown
172.23.0.0/16 dev br-3da2bba1527d proto kernel scope link src 172.23.0.1 linkdown
172.24.0.0/16 dev br-d9754932cc6b proto kernel scope link src 172.24.0.1 linkdown
172.25.0.0/16 dev br-aef1d6ce86ca proto kernel scope link src 172.25.0.1 linkdown
181.96.124.121 via 10.10.4.1 dev tun0 proto static metric 50
192.168.122.0/24 dev virbr0 proto kernel scope link src 192.168.122.1 linkdown
200.43.210.121 via 10.10.4.1 dev tun0 proto static metric 50

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
