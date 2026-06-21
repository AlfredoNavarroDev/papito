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
| POST   | `/register`  | ❌       | Registrar usuario (email, name, password) |
| POST   | `/login`     | ❌       | Iniciar sesión (email, password)   |
| POST   | `/google`    | ❌       | Autenticación con Google (email, googleId) |
| GET    | `/me`        | ✅ JWT   | Obtener perfil del usuario autenticado |

### Productos (`/api/products`)

| Método | Ruta          | Auth     | Rol     | Descripción                        |
|--------|---------------|----------|---------|------------------------------------|
| GET    | `/`           | ❌       | —       | Listar productos (filtros: categoryId, productType, page, limit) |
| GET    | `/:id`        | ❌       | —       | Obtener producto por ID            |
| POST   | `/`           | ✅ JWT   | OWNER   | Crear producto                     |
| PUT    | `/:id`        | ✅ JWT   | OWNER   | Actualizar producto                |
| PATCH  | `/:id/stock`  | ✅ JWT   | OWNER   | Actualizar stock                   |
| DELETE | `/:id`        | ✅ JWT   | OWNER   | Eliminar producto (soft delete)    |

### Categorías (`/api/categories`)

| Método | Ruta    | Auth     | Rol     | Descripción                        |
|--------|---------|----------|---------|------------------------------------|
| GET    | `/`     | ❌       | —       | Listar todas las categorías        |
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

### 🆕 Módulos nuevos a implementar

---

### MÓDULO 1: Addresses (Direcciones de entrega)

**Carpeta a crear:** `src/modules/addresses/`

**¿Para qué sirve?** El cliente guarda sus direcciones para recibir pedidos a domicilio.

**Tabla:** `Address` (ya existe en Prisma ✅)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int | PK |
| `userId` | Int | FK → User (cliente dueño de la dirección) |
| `street` | String | Calle y número |
| `city` | String | Ciudad |
| `reference` | String? | Punto de referencia |
| `isDefault` | Boolean | Dirección por defecto |

**Archivos a crear:**
```
src/modules/addresses/
├── address.controller.js
├── address.service.js
├── address.repository.js
└── address.routes.js
```

**Endpoints:**
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/api/addresses` | ✅ JWT | CUSTOMER | Listar mis direcciones |
| POST | `/api/addresses` | ✅ JWT | CUSTOMER | Crear dirección |
| PUT | `/api/addresses/:id` | ✅ JWT | CUSTOMER | Actualizar dirección |
| DELETE | `/api/addresses/:id` | ✅ JWT | CUSTOMER | Eliminar dirección |

**Lógica de negocio:**
- Solo el `CUSTOMER` dueño puede ver/editar sus direcciones
- Al marcar `isDefault=true`, las demás se desmarcan automáticamente
- No eliminar si está siendo usada en un pedido activo

---

### MÓDULO 2: Orders (Pedidos) — El corazón del e-commerce

**Carpeta a crear:** `src/modules/orders/`

**¿Para qué sirve?** Aquí vive toda la lógica del carrito de compras y creación de pedidos.

**Tablas:** `Order`, `OrderItem`, `OrderItemModifier` (ya existen en Prisma ✅)

**Campos importantes de `Order`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int | PK |
| `userId` | Int | FK → User (cliente que compra) |
| `addressId` | Int? | FK → Address (null si es LOCAL) |
| `deliveryType` | DeliveryType | `DELIVERY` o `LOCAL` |
| `status` | OrderStatus | `PENDING` → `PAID` → `PREPARING` → `READY` → `DELIVERED` |
| `subtotal` | Decimal | Suma de todos los items |
| `deliveryFee` | Decimal | Costo de envío (0 si LOCAL) |
| `total` | Decimal | subtotal + deliveryFee |
| `notes` | String? | Notas del cliente |

**Campos importantes de `OrderItem`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int | PK |
| `orderId` | Int | FK → Order |
| `productId` | Int | FK → Product |
| `productSizeId` | Int? | FK → ProductSize (si aplica) |
| `quantity` | Int | Cantidad |
| `unitPrice` | Decimal | Precio unitario al momento de la compra |
| `totalPrice` | Decimal | unitPrice × quantity + modificadores |

**Archivos a crear:**
```
src/modules/orders/
├── order.controller.js
├── order.service.js
├── order.repository.js
└── order.routes.js
```

**Endpoints:**
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/api/orders` | ✅ JWT | CUSTOMER | Crear pedido (carrito) |
| GET | `/api/orders` | ✅ JWT | OWNER, ADMIN | Listar TODOS los pedidos |
| GET | `/api/orders/my-orders` | ✅ JWT | CUSTOMER | Listar SOLO mis pedidos |
| GET | `/api/orders/:id` | ✅ JWT | CUSTOMER | Ver detalle (solo si es suyo) |
| PATCH | `/api/orders/:id/status` | ✅ JWT | OWNER, ADMIN | Cambiar estado |

**Lógica de negocio paso a paso:**

**1. Crear pedido — Body que envía el cliente:**
```json
{
  "deliveryType": "DELIVERY",
  "addressId": 1,
  "notes": "Sin azúcar por favor",
  "items": [
    {
      "productId": 1,
      "productSizeId": 2,
      "quantity": 2,
      "modifiers": [{ "modifierId": 1 }]
    },
    {
      "productId": 3,
      "quantity": 1,
      "modifiers": []
    }
  ]
}
```

**2. Validaciones:**
- Verificar que todos los `productId` existen y están activos
- Verificar stock suficiente para cada producto
- Si `deliveryType = DELIVERY`, `addressId` es obligatorio
- Si `deliveryType = LOCAL`, `addressId` debe ser null

**3. Cálculo de precios:**
```
unitPrice = product.basePrice (o productSize.price si aplica)
totalPrice = (unitPrice × quantity) + suma(extraPrice de modifiers)
subtotal = suma de todos los totalPrice
deliveryFee = 0 si LOCAL, 5.00 si DELIVERY
total = subtotal + deliveryFee
```

**4. Descontar stock:**
```js
product.stock = product.stock - item.quantity
```

**5. Transición de estados (solo hacia adelante):**
```
PENDING ──► PAID ──► PREPARING ──► READY ──► DELIVERED
```
- `PENDING` → cuando el cliente crea el pedido
- `PAID` → cuando el pago se confirma (vía webhook)
- `PREPARING` → el dueño empieza a preparar
- `READY` → el pedido está listo
- `DELIVERED` → se entregó al cliente
- Solo `OWNER` y `ADMIN` pueden cambiar estados
- Si el pago es rechazado → restaurar stock, pedido vuelve a `PENDING`

---

### MÓDULO 3: Payments (Pagos con Mercado Pago)

**Carpeta a crear:** `src/modules/payments/`

**¿Para qué sirve?** Integrar pagos reales con Mercado Pago.

**Tabla:** `Payment` (ya existe en Prisma ✅)

**Campos importantes:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int | PK |
| `orderId` | Int | FK → Order (único por pedido) |
| `mpPaymentId` | String? | ID del pago en Mercado Pago |
| `mpPreferenceId` | String? | ID de la preferencia en MP |
| `status` | PaymentStatus | `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED` |
| `amount` | Decimal | Monto del pago |

**Archivos a crear:**
```
src/modules/payments/
├── payment.controller.js
├── payment.service.js
├── payment.repository.js
└── payment.routes.js
```

**Endpoints:**
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/payments/create-preference` | ✅ JWT | Crear preferencia de pago en MP |
| POST | `/api/payments/webhook` | ❌ | Webhook de MP (notificaciones) |
| GET | `/api/payments/:orderId` | ✅ JWT | Ver estado del pago |

**Lógica de negocio:**
1. **Crear preferencia:** El cliente paga → se crea preferencia en MP con los datos del pedido
2. **Webhook:** MP notifica automáticamente cuando el pago es aprobado o rechazado
3. **Pago aprobado:** `Payment.status = APPROVED`, `Order.status = PAID`
4. **Pago rechazado:** `Payment.status = REJECTED`, restaurar stock, orden vuelve a `PENDING`

---

### MÓDULO 4: Seed de Base de Datos

**Archivo a crear:** `prisma/seed.js`

**Datos de prueba:**
- **Categorías:** Café en Grano, Café Molido, Bebidas Calientes, Bebidas Frías, Accesorios
- **Productos:** 2-3 por categoría con precios, imágenes, tamaños y modificadores
- **Usuarios:**
  - `admin@coffeevibes.com` / `admin123` (rol: ADMIN)
  - `owner@coffeevibes.com` / `owner123` (rol: OWNER)
  - `cliente@test.com` / `test123` (rol: CUSTOMER)

---

### 🗺️ Resumen del flujo completo del e-commerce

```
 1. Cliente se registra / inicia sesión    →  Auth          (✅ LISTO)
 2. Explora productos y categorías          →  Catálogo      (✅ LISTO)
 3. Guarda su dirección de entrega          →  Addresses     (✅ IMPLEMENTADO)
 4. Arma su pedido (carrito)                →  Orders        (✅ IMPLEMENTADO)
 5. Paga con Mercado Pago                   →  Payments      (✅ IMPLEMENTADO)
 6. Dueño ve el pedido y lo prepara         →  Orders        (✅ IMPLEMENTADO)
 7. Dueño marca como listo/entregado        →  Orders        (✅ IMPLEMENTADO)

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




