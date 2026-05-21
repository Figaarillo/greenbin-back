# Propuesta 05 — Mejoras de Seguridad en Autenticación

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Bajo (1 sprint)
> **Dependencias:** Ninguna

## 1. Problemas Detectados

### 1.1 Refresh Token "Implícito" sin Rotation

El PRD menciona "JWT con refresh implícito", lo que sugiere que el refresh token no está completamente implementado o no sigue las mejores prácticas. Sin **refresh token rotation**, si un refresh token es comprometido, puede usarse indefinidamente para generar nuevos access tokens.

### 1.2 Sin Rate Limiting en Endpoints de Auth

Los endpoints `/login` y `/password-reset` no tienen rate limiting. Esto permite:

- Ataques de fuerza bruta al login
- Enumeración de usuarios válidos
- Abuso del password reset (envío masivo de emails)

### 1.3 Sin Bloqueo por Intentos Fallidos

No hay protección contra múltiples intentos de login fallidos. Un atacante puede probar contraseñas indefinidamente.

### 1.4 Contraseñas: Sin Política de Complejida

La validación de password se maneja desde el handler/DTO, no hay una política de seguridad centralizada que exija:

- Longitud mínima (8+ caracteres)
- Complejidad (mayúscula + minúscula + número)
- Prevención de contraseñas comunes

### 1.5 JWT: Sin Blacklist de Tokens

No hay forma de invalidar un JWT antes de su expiración natural (ej: cuando un vecino cambia su contraseña).

## 2. Solución Propuesta

### 2.1 Refresh Token Rotation Completo

```typescript
// src/auth/domain/entities/refresh-token.entity.ts (NUEVA ENTIDAD)

@Entity({ tableName: 'refresh_tokens' })
class RefreshTokenEntity extends BaseEntity {
  @ManyToOne()
  user: NeighborEntity | ResponsibleEntity | EntityEntity | RewardPartnerEntity

  @Property()
  token: string // hash del refresh token (nunca se guarda el token plano)

  @Property()
  familyId: string // UUID que identifica la "familia" del token (para rotation tracking)

  @Property()
  expiresAt: Date

  @Property({ default: false })
  isRevoked: boolean

  @Property({ nullable: true })
  revokedAt: Date

  @Property({ nullable: true })
  replacedByToken: string // cuando se hace rotate, el nuevo token apunta al que reemplazó

  @Property()
  userRole: string // para saber a qué entidad pertenece
}
```

**Flujo de Rotation:**

```
1. Vecino loguea → se genera AccessToken (15min) + RefreshToken (30 días)
2. Vecino usa RefreshToken → se VALIDA + se REVOCA + se genera NUEVO RefreshToken
3. Si un RefreshToken REVOCADO se reutiliza → la "familia" completa se invalida (robo detectado)
```

```typescript
// Lógica de rotation
class RefreshTokenRotationUseCase {
  async rotate(oldRefreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.repo.findByToken(hash(oldRefreshToken))

    if (!storedToken || storedToken.isRevoked) {
      // Intento de reuso de token revocado → la familia completa se invalida
      if (storedToken) {
        await this.repo.revokeFamily(storedToken.familyId)
        // Opcional: notificar al usuario que su sesión fue comprometida
      }
      throw new UnauthorizedError('Invalid refresh token')
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired')
    }

    // Revocar el token actual
    const newToken = await this.generateToken()
    storedToken.isRevoked = true
    storedToken.replacedByToken = hash(newToken)
    await this.repo.save(storedToken)

    // Guardar el nuevo token (misma familyId)
    await this.repo.save(new RefreshTokenEntity(
      storedToken.user,
      hash(newToken),
      storedToken.familyId,
      30.days.fromNow()
    ))

    // Generar nuevo AccessToken
    const accessToken = await this.jwtService.generateAccessToken(storedToken.user)

    return { accessToken, refreshToken: newToken }
  }
}
```

### 2.2 Rate Limiting

```typescript
// Middleware de rate limiting para auth

// Opción A: Usar @fastify/rate-limit (plugin oficial)
import rateLimit from '@fastify/rate-limit'

await app.register(rateLimit, {
  max: 100, // 100 requests por minuto en general
  timeWindow: '1 minute'
})

// Configuración específica por ruta:
// POST /api/auth/login → max: 10 requests/minuto por IP
// POST /api/auth/refresh → max: 20 requests/minuto por IP
// POST /api/auth/password-reset → max: 3 requests/hora por email
```

### 2.3 Bloqueo por Intentos Fallidos

```typescript
// src/auth/domain/entities/login-attempt.entity.ts (NUEVA ENTIDAD)

@Entity({ tableName: 'login_attempts' })
class LoginAttemptEntity extends BaseEntity {
  @Property()
  identifier: string // email o username

  @Property()
  ipAddress: string

  @Property({ default: 0 })
  failedAttempts: number = 0

  @Property({ nullable: true })
  lockedUntil: Date // null = no bloqueado

  @Property()
  lastAttemptAt: Date
}
```

**Política de bloqueo:**

| Intentos fallidos consecutivos | Acción                                      |
| ------------------------------ | ------------------------------------------- |
| 1-4                            | Solo registro (log)                         |
| 5                              | Bloquear 5 minutos                          |
| 8                              | Bloquear 15 minutos                         |
| 10+                            | Bloquear 1 hora                             |
| 20+                            | Bloquear hasta desbloqueo manual por Entity |

### 2.4 Política de Contraseñas

```typescript
// src/auth/domain/services/password-policy.service.ts (NUEVO)

class PasswordPolicy {
  static readonly MIN_LENGTH = 8
  static readonly MAX_LENGTH = 128
  static readonly REQUIRE_UPPERCASE = true
  static readonly REQUIRE_LOWERCASE = true
  static readonly REQUIRE_NUMBER = true
  static readonly REQUIRE_SPECIAL_CHAR = true
  static readonly COMMON_PASSWORDS = [
    '123456', 'password', '12345678', 'qwerty', 'abc123', ...
  ]

  static validate(password: string): ValidationResult {
    const errors: string[] = []

    if (password.length < this.MIN_LENGTH) errors.push(`Mínimo ${this.MIN_LENGTH} caracteres`)
    if (password.length > this.MAX_LENGTH) errors.push(`Máximo ${this.MAX_LENGTH} caracteres`)
    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) errors.push('Debe contener mayúscula')
    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) errors.push('Debe contener minúscula')
    if (this.REQUIRE_NUMBER && !/\d/.test(password)) errors.push('Debe contener número')
    if (this.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener un carácter especial')
    }
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Contraseña demasiado común')
    }

    return { valid: errors.length === 0, errors }
  }
}
```

### 2.5 JWT Blacklist (para cambio de contraseña / logout)

```typescript
// Opción recomendada: Lista negra en memoria (Set) o Redis.
// Para evitar checkear DB en cada request.

// src/auth/infrastructure/jwt-blacklist.service.ts
class JwtBlacklist {
  private blacklist = new Set<string>() // en producción: Redis

  async add(jti: string, expiresAt: Date): Promise<void> {
    this.blacklist.add(jti)
    // Opcional: cleanup automático cuando expira
    setTimeout(() => this.blacklist.delete(jti), expiresAt.getTime() - Date.now())
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    return this.blacklist.has(jti)
  }
}

// En el middleware de auth:
// const payload = jwt.verify(token)
// if (await blacklist.isBlacklisted(payload.jti)) throw new UnauthorizedError()
```

### 2.6 Configuración

```env
# Nuevas variables
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
JWT_ISSUER=greenbin
LOGIN_MAX_ATTEMPTS=5
LOGIN_BLOCK_DURATION_MINUTES=5
PASSWORD_MIN_LENGTH=8
RATE_LIMIT_ENABLED=true
```

### 2.7 Endpoints Afectados

| Endpoint                        | Cambio                                           |
| ------------------------------- | ------------------------------------------------ |
| `POST /api/auth/login`          | Rate limiting + bloqueo + refresh token rotation |
| `POST /api/auth/refresh`        | Implementar rotation                             |
| `POST /api/auth/logout`         | Revocar refresh token + blacklist access token   |
| `POST /api/auth/password-reset` | Rate limiting por email                          |
| `PUT /api/auth/password`        | Invalidar todos los refresh tokens del usuario   |
| `POST /api/neighbor`            | Validar password policy al crear vecino          |
| `POST /api/responsible`         | Validar password policy                          |
| `POST /api/reward-partner`      | Validar password policy                          |
| `POST /api/entity`              | Validar password policy                          |

### 2.8 Dependencias Nuevas

```json
{
  "dependencies": {
    "@fastify/rate-limit": "^9.0.0"
  }
}
```

### 2.9 Consideraciones Técnicas

1. **Migración de tokens existentes**: Los vecinos con sesiones activas no deberían perder el acceso. Se puede implementar gradualmente: los nuevos tokens usan rotation, los viejos siguen funcionando hasta que expiren.
2. **Performance del rate limiting**: `@fastify/rate-limit` usa memoria por defecto (Redis opcional). Para múltiples instancias, se necesita Redis compartido.
3. **Notificar al usuario**: Cuando se detecta un intento de reuso de refresh token revocado (posible robo), se debería notificar al vecino por email (#01).
4. **Testing**: Probar escenarios de seguridad: refresh token expirado, token robado, fuerza bruta, etc.

---

## 3. Integración con Otras Propuestas

- **Notificaciones (#01)**: Notificar al vecino cuando su cuenta se bloquea o cuando se detecta actividad sospechosa
- **Timeline (#07)**: Registrar eventos de seguridad (login, cambio de password, bloqueo)
