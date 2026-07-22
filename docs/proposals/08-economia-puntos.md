# Propuesta 08 — Economía y Respaldo de Puntos

> **Tipo:** Análisis de riesgo + propuesta de solución
> **Prioridad sugerida:** Alta (es la base de la confianza del programa)
> **Esfuerzo estimado:** Medio-Alto (2-3 sprints, se puede fasear)
> **Dependencias:** Ninguna para empezar. Bloquea/condiciona a #02 (Gamificación) y a cualquier feature que muestre el impacto del programa hacia afuera (portales de impacto, ROI de locales, etc.)

## 1. Contexto

Este documento no nace de un ticket ni de un bug reportado — nace de revisar en detalle cómo se otorgan y se gastan los puntos en el sistema, buscando dónde podría fallar la "economía" del programa antes de que falle en producción. Está escrito para alguien que conoce el código pero no participó de esa revisión.

Recordatorio rápido del circuito de puntos, para tener el mapa completo:

```
Vecino entrega residuo → Responsable registra peso →
  puntos = peso × pointsPerWeight (de la categoría) → se suman a neighbor.points
                                                              │
                                                              ▼
Vecino canjea cupón (paga costInPoints) → se restan de neighbor.points →
  CouponTransaction en estado ADQUIRIDO → el vecino la usa en el comercio →
  estado USADO → el comercio le da el descuento real
```

Archivos clave: `waste-transaction/application/usecases/register-waste-delivery.usecase.ts`, `coupon-transaction/application/usecases/redeem-coupon.usecase.ts`, `coupon-transaction/application/usecases/use-coupon.usecase.ts`, `neighbor/domain/entities/neighbor.entity.ts`, `coupon/domain/entities/coupon.entity.ts`.

## 2. El problema de fondo

Los puntos funcionan como una moneda: se emiten cuando alguien recicla, se destruyen cuando se canjean por un cupón. Pero es una moneda con una particularidad que no tiene ningún control hoy:

**Quien decide cuánta moneda se emite no es quien paga el costo real de esa moneda, y quien paga el costo real no tiene ninguna palanca sobre cuánto se emite.**

- La **entidad** (municipio/cooperativa) fija `pointsPerWeight` por categoría (`waste-category.entity.ts:13`) — decide cuántos puntos se crean cada vez que alguien recicla. No hay techo de emisión total, ni por período, ni por vecino.
- El **reward partner** (comercio adherido) es quien paga el costo real cuando el vecino usa el cupón — un descuento real de su bolsillo. Pero no controla el volumen de vecinos que pueden pagarlo: solo fija `costInPoints` (el "precio" del cupón en puntos), no cuántas veces se puede comprar.
- La **entidad** tampoco sabe cuánto le "debe" el sistema a sus locales en un momento dado: no existe en ningún lado un cálculo de "puntos vivos sin canjear" = descuentos comprometidos pendientes.

Es análogo a un banco central que emite moneda sin consultar a los comercios que están obligados a aceptarla, y sin llevar un libro contable de cuánto emitió.

## 3. Hallazgos concretos

Cada uno de estos está verificado en el código actual, no es especulación:

### 3.1 Race condition / doble gasto en el canje
`redeem-coupon.usecase.ts:27-58` — se **lee** `neighbor.points` para validar, y varias líneas después se **escribe** la resta (`subtractPoints.exec(...)`), sin lock ni transacción entre medio. Dos canjes concurrentes del mismo vecino (doble tap, dos pestañas, retry de red) pueden ambos pasar la validación y ambos restar → saldo negativo. Nada en `neighbor.entity.ts` ni en el repositorio impide que `points` quede en negativo.

### 3.2 Cupones sin stock
`coupon.entity.ts` no tiene ningún campo de cantidad disponible. Un local que en la vida real ofrece "10% off, 20 cupones" no tiene forma de topearlo en el sistema: cualquier cantidad de vecinos puede canjear el mismo cupón hasta que alguien lo apague manualmente (`isAvailable`), afectando también a quienes todavía no lo habían canjeado.

### 3.3 Sin límite de peso en la entrega
`register-waste-delivery.usecase.ts:35` calcula `newWaste.calculatePoints()` sobre el peso que carga el responsable sin ningún techo razonable. Un error de tipeo o una carga maliciosa (9999 kg en vez de 9,999 kg) acredita puntos reales, canjeables por descuentos reales, sin ninguna alerta.

### 3.4 Sin idempotencia en la entrega
El mismo usecase no tiene ninguna clave de idempotencia. Un doble submit (reintento de red, doble click del responsable) acredita puntos dos veces por la misma entrega física.

### 3.5 Múltiples escrituras sin transacción atómica
`register-waste-delivery.usecase.ts` hace, en secuencia: `registerWaste` → `registerTransactionDetail` → `neighbor.addPoints` → `updateTransaction`, cada uno con su propio `await`, sin envolver todo en `em.transactional()`. Si falla un paso a mitad de camino, puede quedar un estado inconsistente entre lo que el vecino "tiene" y lo que está persistido en el historial.

### 3.6 Sin ledger / libro de movimientos
`neighbor.points` es un único número mutable (`neighbor.entity.ts:47`). No existe un registro inmutable de movimientos (cuánto se emitió, cuánto se gastó, por qué). Si aparece una inconsistencia — por ejemplo, por 3.1 — no hay forma de reconstruir qué pasó ni de reconciliar.

### 3.7 Los puntos no vencen
A diferencia de los cupones (`validDays`), los puntos del vecino se acumulan indefinidamente. El pasivo pendiente del programa no tiene ningún horizonte finito — no se puede proyectar ni presupuestar.

### 3.8 Sin reembolso cuando un cupón no se usa
Según `docs/coupon-transaction-state-machine.md`, un `CouponTransaction` en estado `ADQUIRIDO` puede pasar a `EXPIRADO` si supera `expirationDate`. Pero no existe ningún usecase de expiración implementado (`rg -l "expire" src/coupon-transaction/application/usecases` no devuelve nada), y tampoco existe ningún mecanismo de reembolso de puntos al vecino si el cupón vence sin usarse. En la práctica, el vecino pierde los puntos gastados sin ninguna compensación ni aviso.

### 3.9 Sin aislamiento entre entidades en el canje
`redeem-coupon.payload.ts` solo tiene `{ couponId, neighborId }` — **no hay ningún campo ni validación de que el `rewardPartner` del cupón pertenezca a la misma `entity` que el vecino**. Esto significa que un vecino registrado en la Municipalidad de Villa María podría, hoy, canjear puntos en un cupón ofrecido por un comercio adherido a la Cooperativa EcoVerde. El comercio termina dando un descuento a alguien fuera del programa que negoció con él, y ninguna de las dos entidades tiene visibilidad de que ese cruce ocurrió. Esto no es solo un bug de datos — multiplica el problema de fondo, porque el pasivo generado por una entidad puede terminar pagándolo un comercio de otra.

### 3.10 `pointsPerWeight` sin versionado
`waste-category.entity.ts` guarda `pointsPerWeight` como un único valor mutable, sin historial de cambios ni vigencia. Si la entidad lo modifica (por ejemplo, para frenar la emisión), no queda registro de cuándo cambió ni por qué, y el cambio aplica de inmediato sin período de aviso a los vecinos.

## 4. Consecuencias si esto no se aborda

1. **Inflación sin freno**: cuanto más éxito tiene el programa, más "moneda" se emite, sin relación con cuánto pueden sostener los locales adheridos. El éxito del programa es, tal como está, un riesgo creciente.
2. **El comercio no tiene salida de emergencia**: si un cupón se vuelve popular, el reward partner solo puede apagarlo del todo (3.2), no limitarlo.
3. **La entidad no ve venir el problema**: nadie suma cuántos puntos están vivos = deuda potencial en descuentos (3.6, 3.7).
4. **Un pico de canjes simultáneo** (por ejemplo, después de una campaña de difusión) puede generar una demanda de descuentos que ningún comercio anticipó.
5. **Pérdida de confianza del vecino**: puntos que desaparecen por un cupón vencido sin devolución (3.8), o ajustes de emisión sin aviso (3.10), erosionan la confianza en que "reciclar = valor real".
6. **Fuga de pasivo entre entidades** (3.9): una entidad puede terminar generando costo real para comercios de otra entidad sin que ninguna de las dos lo sepa.
7. **Sin auditoría**: ante cualquier reclamo ("me faltan puntos", "me cobraron dos veces") no hay forma de reconstruir el historial real de movimientos (3.6).

## 5. Cómo se podría resolver

No es una sola solución — son piezas complementarias, ordenadas por lo que desbloquean:

### 5.1 Ledger de puntos (base de todo lo demás)
En vez de mutar directamente `neighbor.points`, registrar cada movimiento como un asiento inmutable: `{ neighborId, delta, reason, sourceTransactionId, balanceAfter, timestamp }`. El saldo se deriva sumando el ledger (o se cachea y se reconcilia periódicamente contra él). Sin esto, ninguna de las siguientes piezas es auditable.

### 5.2 Operación atómica de canje
Resolver 3.1 con un `UPDATE ... WHERE points >= costInPoints` atómico, o una transacción con lock pesimista sobre el vecino durante el canje. Aplica también a `register-waste-delivery` (3.5): envolver todo el flujo en `em.transactional()`.

### 5.3 Stock por cupón + presupuesto por reward partner
Agregar `maxRedemptions` a `CouponEntity` (resuelve 3.2) y, más adelante, dejar que el reward partner defina un presupuesto de descuentos por período. Le devuelve control real a quien paga el costo.

### 5.4 Techo de emisión del lado de la entidad
Un presupuesto de puntos a emitir por período, coherente con lo que la entidad negoció con sus locales. El sistema avisa o bloquea antes de emitir de más, en vez de descubrirlo después.

### 5.5 Aislamiento por entidad en el canje
Validar en `redeem-coupon.usecase.ts` que `neighbor.entity.id === coupon.rewardPartner.entity.id` antes de permitir el canje (resuelve 3.9). Es el fix más barato de esta lista y probablemente el de mayor prioridad — es un bug de integridad de datos, no solo un tema de diseño económico.

### 5.6 Panel de pasivo pendiente
`SUM(points)` de los vecinos de una entidad = deuda potencial en descuentos. Requiere 5.1 para ser confiable. Es la pieza "vendible" — lo que la entidad puede mirar para saber si el programa es sostenible.

### 5.7 Vencimiento de puntos, con aviso previo
Igual que los cupones, poner un horizonte (ej. 12 meses) le da a la entidad un pasivo finito y proyectable. Requiere avisar al vecino con anticipación para no repetir el problema de 3.10.

### 5.8 Reembolso automático en expiración/cancelación de cupón
Cuando un `CouponTransaction` pasa a `EXPIRADO` (hoy ni siquiera hay un job que dispare esa transición), devolver los puntos al vecino vía el ledger (resuelve 3.8).

### 5.9 Versionado de `pointsPerWeight`
Guardar historial de cambios con vigencia desde/hasta, para poder auditar y comunicar cambios de puntaje con anticipación en vez de aplicarlos de un día para el otro.

## 6. Priorización sugerida

| Orden | Ítem | Por qué primero |
|---|---|---|
| 1 | 5.5 Aislamiento por entidad | Es un bug de integridad de datos activo hoy, no una mejora — arreglo barato y aislado |
| 2 | 5.2 Operación atómica de canje/entrega | Corta el sangrado de un bug de concurrencia real (doble gasto) |
| 3 | 5.1 Ledger de puntos | Habilita auditoría y es prerrequisito de 5.6, 5.8 y de detectar futuros problemas |
| 4 | 5.3 Stock de cupones | Le da control real al actor que hoy no tiene ninguno (el comercio) |
| 5 | 5.6 Panel de pasivo | Primera pieza visible para la entidad, ya con datos confiables (depende de 5.1) |
| 6 | 5.4 Techo de emisión | Requiere que la entidad primero vea el problema (5.6) para poder calibrar el techo |
| 7 | 5.7 / 5.8 / 5.9 | Mejoras de sostenibilidad y confianza a mediano plazo |

## 7. Relación con otras propuestas existentes

- **#02 Gamificación**: cualquier mecánica de competencia/rankings que use puntos como "puntaje" se apoya en que el conteo de puntos sea confiable — depende de 5.1 y 5.2.
- Cualquier futura vidriera pública de impacto (portal de transparencia, reportes exportables) va a mostrar números de reciclaje y puntos — si la economía de base tiene los problemas de la sección 3, esos números públicos heredan la misma falta de respaldo.
