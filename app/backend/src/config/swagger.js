const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Coffee Vibes API",
      version: "1.0.0",
      description:
        "API REST para el e-commerce de café Coffee Vibes. Permite gestionar usuarios, productos, categorias, pedidos y pagos.",
      contact: {
        name: "Desarrollador: Roberto Lopez",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["CUSTOMER", "OWNER", "ADMIN"] },
            phone: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Address: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            street: { type: "string" },
            city: { type: "string" },
            reference: { type: "string" },
            isDefault: { type: "boolean" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            imageUrl: { type: "string" },
            categoryId: { type: "integer" },
            productType: { type: "string" },
            hasSizes: { type: "boolean" },
            basePrice: { type: "number", format: "decimal" },
            stock: { type: "integer" },
            isActive: { type: "boolean" },
            sizes: {
              type: "array",
              items: { $ref: "#/components/schemas/ProductSize" },
            },
            modifiers: {
              type: "array",
              items: { $ref: "#/components/schemas/ProductModifier" },
            },
          },
        },
        ProductSize: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            size: { type: "string", enum: ["SMALL", "MEDIUM", "LARGE"] },
            price: { type: "number", format: "decimal" },
          },
        },
        ProductModifier: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            name: { type: "string" },
            extraPrice: { type: "number", format: "decimal" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            addressId: { type: "integer" },
            deliveryType: { type: "string", enum: ["DELIVERY", "LOCAL"] },
            status: {
              type: "string",
              enum: ["PENDING", "PAID", "PREPARING", "READY", "DELIVERED"],
            },
            subtotal: { type: "number", format: "decimal" },
            deliveryFee: { type: "number", format: "decimal" },
            total: { type: "number", format: "decimal" },
            notes: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            payment: { $ref: "#/components/schemas/Payment" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            productSizeId: { type: "integer" },
            quantity: { type: "integer" },
            unitPrice: { type: "number", format: "decimal" },
            totalPrice: { type: "number", format: "decimal" },
            modifiers: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItemModifier" },
            },
          },
        },
        OrderItemModifier: {
          type: "object",
          properties: {
            id: { type: "integer" },
            orderItemId: { type: "integer" },
            modifierId: { type: "integer" },
            extraPrice: { type: "number", format: "decimal" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            orderId: { type: "integer" },
            mpPaymentId: { type: "string" },
            mpPreferenceId: { type: "string" },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED", "REFUNDED"],
            },
            amount: { type: "number", format: "decimal" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Autenticacion"],
          summary: "Registrar un nuevo usuario",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "name"],
                  properties: {
                    email: { type: "string", format: "email", example: "cliente@test.com" },
                    password: { type: "string", format: "password", example: "test123" },
                    name: { type: "string", example: "Cliente Test" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Usuario registrado exitosamente" },
            400: { description: "Error de validacion", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Autenticacion"],
          summary: "Iniciar sesion",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "owner@coffeevibes.com" },
                    password: { type: "string", format: "password", example: "owner123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Token JWT generado" },
            401: { description: "Credenciales invalidas" },
          },
        },
      },
      "/api/auth/google": {
        post: {
          tags: ["Autenticacion"],
          summary: "Autenticacion con Google OAuth",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "googleId"],
                  properties: {
                    email: { type: "string", format: "email" },
                    googleId: { type: "string" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Token JWT generado" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Autenticacion"],
          summary: "Obtener perfil del usuario autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Datos del usuario", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            401: { description: "No autenticado" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Productos"],
          summary: "Listar productos",
          parameters: [
            { name: "categoryId", in: "query", schema: { type: "integer" }, description: "Filtrar por categoria" },
            { name: "productType", in: "query", schema: { type: "string" }, description: "Filtrar por tipo (grano, molido, bebida, accesorio)" },
            { name: "page", in: "query", schema: { type: "integer" }, description: "Numero de pagina" },
            { name: "limit", in: "query", schema: { type: "integer" }, description: "Limite por pagina" },
          ],
          responses: {
            200: { description: "Lista de productos", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } },
          },
        },
        post: {
          tags: ["Productos"],
          summary: "Crear producto (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "categoryId", "productType", "basePrice"],
                  properties: {
                    name: { type: "string", example: "Cafe Latte" },
                    description: { type: "string" },
                    imageUrl: { type: "string" },
                    categoryId: { type: "integer", example: 1 },
                    productType: { type: "string", example: "bebida" },
                    basePrice: { type: "number", example: 10.0 },
                    stock: { type: "integer", example: 100 },
                    hasSizes: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Producto creado" },
            400: { description: "Error de validacion" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Productos"],
          summary: "Obtener producto por ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Producto encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            404: { description: "Producto no encontrado" },
          },
        },
        put: {
          tags: ["Productos"],
          summary: "Actualizar producto (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    basePrice: { type: "number" },
                    stock: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Producto actualizado" },
            403: { description: "No autorizado" },
            404: { description: "Producto no encontrado" },
          },
        },
        delete: {
          tags: ["Productos"],
          summary: "Eliminar producto (soft delete) (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Producto eliminado (desactivado)" },
            403: { description: "No autorizado" },
            404: { description: "Producto no encontrado" },
          },
        },
      },
      "/api/products/{id}/stock": {
        patch: {
          tags: ["Productos"],
          summary: "Actualizar stock de producto (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["stock"],
                  properties: { stock: { type: "integer", example: 50 } },
                },
              },
            },
          },
          responses: {
            200: { description: "Stock actualizado" },
            400: { description: "Stock invalido" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categorias"],
          summary: "Listar todas las categorias",
          responses: {
            200: { description: "Lista de categorias", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } },
          },
        },
        post: {
          tags: ["Categorias"],
          summary: "Crear categoria (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string", example: "Cafe en Grano" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Categoria creada" },
            400: { description: "Error de validacion" },
          },
        },
      },
      "/api/categories/{id}": {
        put: {
          tags: ["Categorias"],
          summary: "Actualizar categoria (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Categoria actualizada" },
            404: { description: "Categoria no encontrada" },
          },
        },
      },
      "/api/addresses": {
        get: {
          tags: ["Direcciones"],
          summary: "Listar mis direcciones (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de direcciones del usuario", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Address" } } } } },
          },
        },
        post: {
          tags: ["Direcciones"],
          summary: "Crear direccion de entrega (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["street", "city"],
                  properties: {
                    street: { type: "string", example: "Av. Larco 123" },
                    city: { type: "string", example: "Lima" },
                    reference: { type: "string", example: "Cerca al parque" },
                    isDefault: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Direccion creada" },
            400: { description: "Error de validacion" },
          },
        },
      },
      "/api/addresses/{id}": {
        get: {
          tags: ["Direcciones"],
          summary: "Obtener direccion por ID (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Direccion encontrada" },
            403: { description: "No tienes permiso" },
            404: { description: "Direccion no encontrada" },
          },
        },
        put: {
          tags: ["Direcciones"],
          summary: "Actualizar direccion (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    street: { type: "string" },
                    city: { type: "string" },
                    reference: { type: "string" },
                    isDefault: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Direccion actualizada" },
            403: { description: "No tienes permiso" },
            404: { description: "Direccion no encontrada" },
          },
        },
        delete: {
          tags: ["Direcciones"],
          summary: "Eliminar direccion (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Direccion eliminada" },
            403: { description: "No tienes permiso" },
            404: { description: "Direccion no encontrada" },
          },
        },
      },
      "/api/orders": {
        get: {
          tags: ["Pedidos"],
          summary: "Listar pedidos (CUSTOMER ve los suyos, OWNER/ADMIN ve todos)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de pedidos", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Order" } } } } },
          },
        },
        post: {
          tags: ["Pedidos"],
          summary: "Crear pedido (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["deliveryType", "items"],
                  properties: {
                    deliveryType: { type: "string", enum: ["DELIVERY", "LOCAL"], example: "DELIVERY" },
                    addressId: { type: "integer", example: 1, description: "Requerido si deliveryType=DELIVERY" },
                    notes: { type: "string", example: "Sin azucar por favor" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["productId", "quantity"],
                        properties: {
                          productId: { type: "integer", example: 1 },
                          productSizeId: { type: "integer", example: 2 },
                          quantity: { type: "integer", example: 2 },
                          modifiers: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: { modifierId: { type: "integer", example: 1 } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Pedido creado exitosamente" },
            400: { description: "Error de validacion o stock insuficiente" },
          },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Pedidos"],
          summary: "Obtener detalle de pedido",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Detalle del pedido", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
            403: { description: "No tienes permiso" },
            404: { description: "Pedido no encontrado" },
          },
        },
      },
      "/api/orders/{id}/status": {
        patch: {
          tags: ["Pedidos"],
          summary: "Actualizar estado del pedido (OWNER, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["PENDING", "PAID", "PREPARING", "READY", "DELIVERED"],
                      example: "PREPARING",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Estado actualizado" },
            400: { description: "Transicion de estado invalida" },
            403: { description: "No autorizado" },
            404: { description: "Pedido no encontrado" },
          },
        },
      },
      "/api/payments/create-preference": {
        post: {
          tags: ["Pagos"],
          summary: "Crear preferencia de pago en Mercado Pago (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["orderId"],
                  properties: { orderId: { type: "integer", example: 1 } },
                },
              },
            },
          },
          responses: {
            200: { description: "Preferencia creada, devuelve initPoint para redirigir al checkout" },
            400: { description: "El pedido no esta pendiente" },
            403: { description: "No tienes permiso" },
            404: { description: "Pedido no encontrado" },
          },
        },
      },
      "/api/payments/webhook": {
        post: {
          tags: ["Pagos"],
          summary: "Webhook de Mercado Pago (notificaciones de pago)",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "payment" },
                    "data.id": { type: "string", example: "123456789" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Notificacion procesada" },
          },
        },
      },
      "/api/payments/{orderId}": {
        get: {
          tags: ["Pagos"],
          summary: "Ver estado del pago de un pedido (CUSTOMER)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Estado del pago", content: { "application/json": { schema: { $ref: "#/components/schemas/Payment" } } } },
            403: { description: "No tienes permiso" },
            404: { description: "Pago no encontrado" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
