# Propuesta 04 — Catálogo Educativo de Residuos

> **Prioridad sugerida:** Media
> **Esfuerzo estimado:** Medio (1-2 sprints)
> **Dependencias:** Ninguna

## 1. Problema

Hoy `WasteCategory` tiene solo: nombre, pointsPerWeight, descripción breve, co2. No hay:

- Información educativa sobre cómo reciclar cada material
- Imágenes/ilustraciones que muestren qué va en cada categoría
- Tips de preparación (lavar, aplastar, separar)
- Información ambiental (tiempo de degradación, proceso de reciclaje)
- Qué materiales SÍ y NO van en cada categoría

Los vecinos no saben cómo separar correctamente, lo que genera contaminación en los puntos verdes.

## 2. Solución Propuesta

Extender `WasteCategory` con contenido educativo rico, incluyendo SVGs vectoriales que ilustren visualmente qué reciclar y cómo.

### 2.1 Modelo de Datos

```typescript
// Extensión del módulo waste-category existente

// Se AGREGAN campos a WasteCategoryEntity existente:
// @Property({ type: t.text, nullable: true })
// preparationTips: string     // "Lavar y secar antes de reciclar. Aplastar para reducir volumen."
//
// @Property({ type: t.text, nullable: true })
// acceptedMaterials: string   // "Botellas PET, envases de shampoo, bolsas plásticas..."
//
// @Property({ type: t.text, nullable: true })
// rejectedMaterials: string   // "Plásticos no reciclables, PVC, juguetes rotos..."
//
// @Property({ nullable: true })
// degradationYears: number    // "450 años" para plástico
//
// @Property({ type: t.text, nullable: true })
// recyclingProcess: string    // "Se tritura, se lava, se funde y se convierte en nuevo plástico..."
//
// @Property({ nullable: true })
// iconUrl: string             // URL del SVG representativo
//
// @Property({ type: t.json, nullable: true })
// didYouKnow: string[]        // ["1 botella tarda 450 años en degradarse", ...]

// ==========================================
// OPCIONAL: Guías / Tips generales
// ==========================================

@Entity({ tableName: 'recycling_tips' })
class RecyclingTipEntity extends BaseEntity {
  @Property({ type: t.text })
  content: string // "Separá tus residuos en origen: usá una bolsa para reciclables y otra para no reciclables"

  @Property({ nullable: true })
  category: string // general | plastic | paper | glass | metal | electronic | organic

  @Property({ default: true })
  isActive: boolean

  @Property({ nullable: true })
  validFrom: Date // para tips estacionales

  @Property({ nullable: true })
  validTo: Date
}
```

### 2.2 Contenido Educativo por Categoría

Los valores iniciales (hardcodeados en seeders + servidos por API):

| Categoría    | Tips de preparación                                                   | Aceptados                                | Rechazados                                                    | Degradación                             | SVG                  |
| ------------ | --------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | --------------------------------------- | -------------------- |
| Plástico     | "Lavar y secar. Aplastar para reducir volumen. Separar tapas."        | Botellas PET, envases, bolsas            | PVC, juguetes, sunchos                                        | ~450 años                               | botella-plastico.svg |
| Papel/Cartón | "Plegar y aplastar. Sin restos de comida. Separar papel del cartón."  | Diarios, revistas, cajas                 | Papel carbónico, servilletas usadas, tetrabrik                | ~1 año                                  | periodico.svg        |
| Vidrio       | "Enjuagar. Separar por color si aplica. No romper."                   | Botellas, frascos                        | Espejos, focos, vajilla rota                                  | ~4000 años                              | botella-vidrio.svg   |
| Metal        | "Limpiar restos. Aplastar latas. Separar aluminio del acero."         | Latas, aluminio, chapas                  | Aerosoles, pintura, pilas                                     | ~30 años (acero) / ~200 años (aluminio) | lata.svg             |
| Electrónico  | "No desarmar. No tirar a la basura común. Llevar a punto específico." | Celulares, computadoras, cables          | Electrodomésticos grandes, pilas (tienen su propia categoría) | Miles de años                           | celular.svg          |
| Orgánico     | "Ideal para compost. Sin restos de carne ni lácteos."                 | Cáscaras de frutas/verduras, yerba, café | Carne, lácteos, aceite                                        | 2-6 meses                               | manzana.svg          |

### 2.3 Endpoints

```typescript
// === ENDPOINTS PÚBLICOS ===

// Categoría con contenido educativo completo
GET /api/waste-category/:id/educational
→ {
    id: "uuid",
    name: "Plástico",
    description: "Residuos plásticos reciclables",
    pointsPerWeight: 10,
    co2: 2.5,
    // Nuevos campos:
    preparationTips: "Lavar y secar. Aplastar...",
    acceptedMaterials: ["Botellas PET", "Envases de shampoo", ...],
    rejectedMaterials: ["PVC", "Juguetes rotos", ...],
    degradationYears: 450,
    recyclingProcess: "Se tritura, se lava...",
    iconUrl: "/assets/waste-categories/plastic.svg",
    didYouKnow: [
      "1 botella tarda 450 años en degradarse",
      "El plástico reciclado se usa para fabricar nuevas botellas y textiles"
    ]
  }

// Tips del día
GET /api/recycling-tips?category=plastic&limit=1
→ { content: "Lavá las botellas antes de reciclar", category: "plastic" }

GET /api/recycling-tips/random
→ Tip aleatorio (para mostrar en home/dashboard)
```

### 2.4 Assets: SVGs Vectoriales

Cada categoría debe tener un SVG representativo. Características:

```
assets/waste-categories/
├── plastic.svg         // Botella PET estilizada
├── paper.svg           // Periódico / caja de cartón
├── glass.svg           // Botella de vidrio
├── metal.svg           // Lata de aluminio
├── electronic.svg      // Celular / placa electrónica
└── organic.svg         // Manzana / cáscara / hoja
```

**Especificaciones de diseño:**

- Formato: SVG puro (no PNG, no raster)
- Estilo: Flat design, 2-3 colores por icono
- Paleta verde/azul consistente con la marca GreenBin
- ViewBox: 0 0 100 100
- Sin texto en el SVG (accesibilidad + traducción)
- Tamaño: < 5KB cada uno
- Escalable: debe verse bien de 24px a 256px

**Uso en API:**

- Los SVGs se sirven estáticamente desde `/assets/waste-categories/`
- La URL se guarda en `iconUrl` de la categoría
- Alternativa: servir como Data URI en la respuesta JSON (no recomendado para producción)

### 2.5 Integración con Sistema Existente

- **El CRUD actual de categorías NO se rompe**: los nuevos campos son nullable
- **Seeders**: se actualizan para incluir contenido educativo
- **Backfill**: migración que agrega los nuevos campos con valores por defecto
- **El endpoint `GET /api/waste-category/:id`** se puede expandir para devolver los nuevos campos (con un flag `?include=educational` para no romper clientes existentes)

### 2.6 Endpoints de Administración

```typescript
// CRUD extendido (Entity)
PUT /api/waste-category/:id/educational
→ Actualiza solo los campos educativos de una categoría

POST /api/recycling-tips
GET /api/recycling-tips
PUT /api/recycling-tips/:id
DELETE /api/recycling-tips/:id
```

### 2.7 Ideas para Uso en Frontend

- **Página "Cómo reciclar"**: Lista todas las categorías con su info educativa + SVGs
- **Tooltip en el registro de entrega**: Cuando el responsable selecciona una categoría, mostrar un tooltip con "qué es aceptado" y tips
- **Tips rotativos en perfil del vecino**: "Sabías que...?" en el dashboard del vecino
- **Infografía imprimible**: Endpoint que devuelve todos los datos formateados para imprimir un póster informativo

### 2.8 Futuras Extensiones

- **Guías interactivas**: Paso a paso con SVGs animados
- **Calculadora de impacto visual**: "Si reciclás X kg de plástico, equivalen a Y botellas menos en el océano"
- **Multimedia**: Videos cortos embedidos de cómo se recicla cada material
- **Contenido estacional**: Tips específicos para fiestas (ej: "Cómo reciclar tu árbol de Navidad")
- **QR codes**: Para poner en los puntos verdes que lleven a la info educativa

---

## 3. Integración con Otras Propuestas

- **Notificaciones (#01)**: Enviar tips educativos periódicos por email
- **Gamificación (#02)**: Logros específicos por categoría ("Maestro del Plástico") que usan la data educativa
- **Timeline (#07)**: Tips leídos por el vecino se registran en su timeline
- **Catálogo visual**: Los SVGs pueden reutilizarse en badges de gamificación y en el timeline
