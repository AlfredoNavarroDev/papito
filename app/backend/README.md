# ☕ Coffee Vibes — Backend API

**Coffee Vibes** es un e-commerce básico especializado en café. Es una API REST construida con **Node.js + Express** y **PostgreSQL** (vía Prisma ORM) que permite gestionar usuarios, productos, categorías, pedidos y pagos.

---

## 🧱 Stack Tecnológico

| Tecnología       | Versión |
|------------------|---------|
| Node.js          | —       |
| Express          | ^5.2.1  |
| Prisma ORM       | ^7.8.0  |
| PostgreSQL       | —       |
| JWT (jsonwebtoken)| ^9.0.2  |
| bcrypt           | ^5.1.1  |
| Mercado Pago SDK | ^2.0.15 |
| express-validator| ^7.2.1  |

---

## 📁 Estructura del Proyecto

```
coffee_vibes/
└── app/
    └── backend/
        ├── prisma/
        │   ├── schema.prisma          # Modelo de datos (PostgreSQL)
        │   ├── migrations/            # Migraciones de base de datos
        │   └── seed.js                # Script de seed (pendiente)
        ├── src/
        │   ├── app.js                 # Configuración de Express (middlewares, rutas)
        │   ├── server.js              # Punto de entrada del servidor
        │   ├── config/
        │   │   ├── env.js             # Variables de entorno
        │   │   └── database.js        # Instancia de PrismaClient
        │   ├── modules/
        │   │   ├── auth/              # Módulo de autenticación
        │   │   │   ├── auth.controller.js
        │   │   │   ├── auth.service.js
        │   │   │   ├── auth.repository.js
        │   │   │   └── auth.routes.js
        │   │   └── catalog/           # Módulo de catálogo (productos + categorías)
        │   │       ├── catalog.controller.js
        │   │       ├── catalog.service.js
        │   │       ├── catalog.repository.js
        │   │       ├── catalog.routes.js
        │   │       ├── category.controller.js
        │   │       ├── category.service.js
        │   │       ├── category.repository.js
        │   │       └── category.routes.js
        │   └── shared/
        │       ├── middlewares/
        │       │   ├── auth.middleware.js        # Verificación de JWT
        │       │   ├── roles.middleware.js        # Autorización por roles
        │       │   └── error-handler.middleware.js # Manejo global de errores
        │       ├── utils/
        │       │   └── app-error.js              # Clase personalizada de errores
        │       └── validators/
        │           └── validate.js               # Middleware de validación
        ├── .env.example
        ├── package.json
        └── prisma.config.ts
```

---

## 🗄️ Base de Datos — Modelo Entidad-Relación

### Modelos principales:

### 👤 User (Usuario)
| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | Int      | PK, autoincrementable              |
| email      | String   | Único, obligatorio                 |
| name       | String?  | Nombre del usuario                 |
| password   | String?  | Hash bcrypt (null si usa Google)   |
| role       | Role     | `CUSTOMER`, `OWNER` o `ADMIN`      |
| googleId   | String?  | ID único de Google OAuth           |
| phone      | String?  | Teléfono                           |
| addresses  | Address[]| Direcciones del usuario            |
| orders     | Order[]  | Pedidos del usuario                |



### 📍 Address (Dirección)
| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | Int      | PK                                 |
| userId     | Int      | FK → User                          |
| street     | String   | Calle y número                     |
| city       | String   | Ciudad                             |
| reference  | String?  | Punto de referencia                |
| isDefault  | Boolean  | Dirección por defecto              |

### 🏷️ Category (Categoría)
| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | Int      | PK                                 |
| name       | String   | Único, ej: "Café en Grano"        |
| slug       | String   | Único, ej: "cafe-en-grano"        |
| products   | Product[]| Productos de esta categoría        |

### ☕ Product (Producto)
| Campo       | Tipo     | Descripción                        |
|-------------|----------|------------------------------------|
| id          | Int      | PK                                 |
| name        | String   | Nombre del producto                |
| description | String?  | Descripción                        |
| imageUrl    | String?  | URL de la imagen                   |
| categoryId  | Int      | FK → Category                      |
| productType | String   | Tipo (ej: "grano", "molido", "bebida") |
| hasSizes    | Boolean  | Si tiene variantes por tamaño      |
| basePrice   | Decimal  | Precio base                        |
| stock       | Int      | Stock disponible                   |
| isActive    | Boolean  | Soft delete (baja lógica)          |
| sizes       | ProductSize[] | Tamaños disponibles            |
| modifiers   | ProductModifier[] | Modificadores (ej: shot extra) |

### 📏 ProductSize (Tamaño de Producto)
| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | Int      | PK                                 |
| productId  | Int      | FK → Product                       |
| size       | Size     | `SMALL`, `MEDIUM`, `LARGE`         |
| price      | Decimal  | Precio para este tamaño            |

### 🧃 ProductModifier (Modificador)
| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | Int      | PK                                 |
| productId  | Int      | FK → Product                       |
| name       | String   | Ej: "Shot extra de espresso"       |
| extraPrice | Decimal  | Precio adicional                   |

### 📦 Order (Pedido)
| Campo       | Tipo        | Descripción                        |
|-------------|-------------|------------------------------------|
| id          | Int         | PK                                 |
| userId      | Int         | FK → User                          |
| addressId   | Int?        | FK → Address (null si es LOCAL)    |
| deliveryType| DeliveryType| `DELIVERY` o `LOCAL`               |
| status      | OrderStatus | `PENDING` → `PAID` → `PREPARING` → `READY` → `DELIVERED` |
| subtotal    | Decimal     | Subtotal                           |
| deliveryFee | Decimal     | Costo de envío                     |
| total       | Decimal     | Total                              |
| notes       | String?     | Notas del pedido                   |
| items       | OrderItem[] | Items del pedido                   |
| payment     | Payment?    | Pago asociado                      |

### 🛒 OrderItem (Item del Pedido)
| Campo        | Tipo     | Descripción                        |
|--------------|----------|------------------------------------|
| id           | Int      | PK                                 |
| orderId      | Int      | FK → Order                         |
| productId    | Int      | FK → Product                       |
| productSizeId| Int?     | FK → ProductSize                   |
| quantity     | Int      | Cantidad                           |
| unitPrice    | Decimal  | Precio unitario                    |
| totalPrice   | Decimal  | Precio total                       |
| modifiers    | OrderItemModifier[] | Modificadores aplicados   |

### 💳 Payment (Pago)
| Campo         | Tipo          | Descripción                        |
|---------------|---------------|------------------------------------|
| id            | Int           | PK                                 |
| orderId       | Int           | FK → Order (único)                 |
| mpPaymentId   | String?       | ID de pago en Mercado Pago         |
| mpPreferenceId| String?       | ID de preferencia en MP            |
| status        | PaymentStatus | `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED` |
| amount        | Decimal       | Monto                              |

---

## 🔌 Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Ruta         | Auth     | Descripción                        |
|--------|--------------|----------|------------------------------------|
| POST   | `/register`  | ✅       | Registrar usuario (email, name, password) |
| POST   | `/login`     | ✅       | Iniciar sesión (email, password)   |
| POST   | `/google`    | ✅       | Autenticación con Google (email, googleId) |
| GET    | `/me`        | ✅ JWT   | Obtener perfil del usuario autenticado |

### Productos (`/api/products`)

| Método | Ruta          | Auth     | Rol     | Descripción                        |
|--------|---------------|----------|---------|------------------------------------|
| GET    | `/`           | ✅       | —       | Listar productos (filtros: categoryId, productType, page, limit) |
| GET    | `/:id`        | ✅       | —       | Obtener producto por ID            |
| POST   | `/`           | ✅ JWT   | OWNER   | Crear producto                     |
| PUT    | `/:id`        | ✅ JWT   | OWNER   | Actualizar producto                |
| PATCH  | `/:id/stock`  | ✅ JWT   | OWNER   | Actualizar stock                   |
| DELETE | `/:id`        | ✅ JWT   | OWNER   | Eliminar producto (soft delete)    |

### Categorías (`/api/categories`)

| Método | Ruta    | Auth     | Rol     | Descripción                        |
|--------|---------|----------|---------|------------------------------------|
| GET    | `/`     | ✅       | —       | Listar todas las categorías        |
| POST   | `/`     | ✅ JWT   | OWNER   | Crear categoría                    |
| PUT    | `/:id`  | ✅ JWT   | OWNER   | Actualizar categoría               |


---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar e instalar dependencias

```bash
cd app/backend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables necesarias:

| Variable          | Descripción                          |
|-------------------|--------------------------------------|
| `PORT`            | Puerto del servidor (default: 3000)  |
| `DATABASE_URL`    | URL de conexión a PostgreSQL         |
| `JWT_SECRET`      | Secreto para firmar tokens JWT       |
| `JWT_EXPIRES_IN`  | Expiración del token (ej: 24h)       |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago         |
| `MP_PUBLIC_KEY`   | Public Key de Mercado Pago           |
| `CORS_ORIGIN`     | Origen permitido para CORS           |

### 3. Ejecutar migraciones

```bash
npm run db:migrate
```

### 4. Iniciar servidor

```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

---

## 🗃️ Gestión de Base de Datos: Migraciones vs `db push`

El proyecto usa **Prisma Migrate** (comando `prisma migrate dev`), que es el enfoque recomendado para entornos profesionales. Aquí te explico por qué y cómo funciona:

### ✅ Prisma Migrate (el que usamos)

```bash
npm run db:migrate   # Crea y aplica una nueva migración
npm run db:studio    # Abre el explorador visual de datos
```

**Ventajas:**
- Genera archivos SQL en `prisma/migrations/` que se versionan en **Git**
- Puedes revisar el SQL antes de aplicarlo a producción
- Permite **rollback** si algo sale mal
- Es seguro para **producción**
- Todo el equipo tiene el mismo historial de cambios

### ⚡ Prisma db push (alternativa rápida)

```bash
npx prisma db push   # Sincroniza el schema directamente sin crear migración
```

**Cuándo usarlo:**
- Prototipado rápido donde no importa el historial
- Desarrollo local exploratorio
- **No recomendado para producción**

### 🔄 Flujo de trabajo recomendado

1. Haces cambios en `prisma/schema.prisma`
2. Ejecutas `npm run db:migrate` → Prisma genera una migración con los cambios
3. **Siempre subes la carpeta `prisma/migrations/` a Git**
4. Cuando otro dev hace `git pull`, ejecuta `npx prisma migrate dev` para aplicar las migraciones pendientes

> ⚠️ **Importante:** La carpeta `prisma/migrations/` debe estar versionada en Git. No la agregues a `.gitignore`.


---

## 📋 Análisis y Plan de Trabajo

> **Desarrollador:** Roberto López
> **Proyecto:** Coffee Vibes — E-commerce de Café (Backend API)

---

### 🏪 ¿Qué tipo de e-commerce es?

Actualmente el proyecto está diseñado para **una sola cafetería fija** (Coffee Vibes). No hay tabla `Store` ni `Branch`. Los productos, categorías y pedidos son globales de un solo local.

Si en el futuro quisieran expandir a **multi-cafetería** (varios dueños con sus propios locales), se necesitaría:
- Agregar tabla `Store` (nombre, dirección, dueño)
- Relacionar `Product` y `Order` con `Store`
- Cada `OWNER` solo vería sus propios productos y pedidos

Por ahora, con **una sola cafetería** está bien. Se escala después.

---

### 👥 Roles del sistema (3 roles)

| Rol | ¿Quién es? | ¿Qué puede hacer? |
|-----|-----------|-------------------|
| `ADMIN` | Superadmin del sistema | Estadísticas, dashboard global, gestionar owners, ver todos los usuarios, config del sistema |
| `OWNER` | Dueño de la cafetería Coffee Vibes | CRUD productos, CRUD categorías, ver TODOS los pedidos, cambiar estados de pedidos |
| `CUSTOMER` | Cliente que compra café | Ver productos, crear pedidos, ver sus propios pedidos, pagar, gestionar sus direcciones |

**¿Por qué 3 roles?**
- `ADMIN` → visión global del negocio (métricas, usuarios, dueños)
- `OWNER` → operación del día a día (productos, pedidos, preparación)
- `CUSTOMER` → solo compra y ve lo suyo

---

### 🔧 Cambios inmediatos en el código existente

#### 1. Schema de Prisma — Agregar rol `OWNER`

**Archivo:** `prisma/schema.prisma`

```prisma
// ANTES
enum Role {
  CUSTOMER
  ADMIN
}

// DESPUÉS
enum Role {
  CUSTOMER
  OWNER
  ADMIN
}
```

**Comando:** `npm run db:migrate`

#### 2. Rutas de catálogo — Actualizar autorización

**Archivo:** `src/modules/catalog/catalog.routes.js`
```js
// ANTES
authorize("ADMIN")

// DESPUÉS
authorize("OWNER", "ADMIN")
```

**Archivo:** `src/modules/catalog/category.routes.js`
```js
// ANTES
authorize("ADMIN")

// DESPUÉS
authorize("OWNER", "ADMIN")
```

---

### ✅ Módulos implementados

Todos los módulos del e-commerce están implementados y funcionando:

| Módulo | Estado | Archivos |
|--------|--------|----------|
| **Auth** | ✅ Listo | `src/modules/auth/` |
| **Catálogo** | ✅ Listo | `src/modules/catalog/` |
| **Addresses** | ✅ Listo | `src/modules/addresses/` |
| **Orders** | ✅ Listo | `src/modules/orders/` |
| **Payments** | ✅ Listo | `src/modules/payments/` |
| **Seed** | ✅ Listo | `prisma/seed.js` |

---

### 🗺️ Resumen del flujo completo del e-commerce

```
 1. Cliente se registra / inicia sesión    →  Auth          (✅ LISTO)
 2. Explora productos y categorías          →  Catálogo      (✅ LISTO)
 3. Guarda su dirección de entrega          →  Addresses     (✅ LISTO)
 4. Arma su pedido (carrito)                →  Orders        (✅ LISTO)
 5. Paga con Mercado Pago                   →  Payments      (✅ LISTO)
 6. Dueño ve el pedido y lo prepara         →  Orders        (✅ LISTO)
 7. Dueño marca como listo/entregado        →  Orders        (✅ LISTO)

```

---

### 📐 Patrón de arquitectura para cada módulo nuevo

Cada módulo sigue la misma estructura:

```
src/modules/nuevo-modulo/
├── nuevo-modulo.controller.js    # Recibe req/res, llama al service
├── nuevo-modulo.service.js       # Lógica de negocio, validaciones
├── nuevo-modulo.repository.js    # Consultas a BD con Prisma
└── nuevo-modulo.routes.js        # Definición de rutas y validaciones
```

Y en `src/app.js` se registra:
```js
const orderRoutes = require("./modules/orders/order.routes");
app.use("/api/orders", orderRoutes);
```

---

### 📝 Notas de arquitectura

- Patrón **Controller → Service → Repository** para separar responsabilidades
- Los productos usan **soft delete** (`isActive = false`) en lugar de eliminación física
- Los tamaños y modificadores de productos permiten personalizar cada ítem del pedido
- Autenticación soporta **email/password** y **Google OAuth**
- Pagos diseñados para **Mercado Pago** (Checkout Pro / API)




