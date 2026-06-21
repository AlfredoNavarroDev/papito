const prisma = require("../../config/database");
const AppError = require("../../shared/utils/app-error");
const orderRepository = require("./order.repository");

const ORDER_STATUS_FLOW = ["PENDING", "PAID", "PREPARING", "READY", "DELIVERED"];

const getOrders = async (user) => {
  if (user.role === "CUSTOMER") {
    return orderRepository.findAll({ userId: user.id });
  }

  return orderRepository.findAll();
};

const getOrder = async (id, user) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Pedido no encontrado");
  }

  if (user.role === "CUSTOMER" && order.userId !== user.id) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para ver este pedido");
  }

  return order;
};

const createOrder = async (userId, data) => {
  const { deliveryType, addressId, notes, items } = data;

  if (!items || items.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "El pedido debe tener al menos un item");
  }

  if (deliveryType === "DELIVERY" && !addressId) {
    throw new AppError(400, "VALIDATION_ERROR", "Direccion requerida para delivery");
  }

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { sizes: true, modifiers: true },
  });

  const productMap = {};
  for (const product of products) {
    productMap[product.id] = product;
  }

  for (const item of items) {
    const product = productMap[item.productId];

    if (!product) {
      throw new AppError(404, "NOT_FOUND", `Producto con id ${item.productId} no encontrado`);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        400,
        "INSUFFICIENT_STOCK",
        `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`
      );
    }

    if (item.productSizeId) {
      const size = product.sizes.find((s) => s.id === item.productSizeId);
      if (!size) {
        throw new AppError(400, "VALIDATION_ERROR", `Tamaño invalido para ${product.name}`);
      }
    }

    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modifier = product.modifiers.find((m) => m.id === mod.modifierId);
        if (!modifier) {
          throw new AppError(400, "VALIDATION_ERROR", `Modificador invalido para ${product.name}`);
        }
      }
    }
  }

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = productMap[item.productId];
    let unitPrice = Number(product.basePrice);

    if (item.productSizeId) {
      const size = product.sizes.find((s) => s.id === item.productSizeId);
      unitPrice = Number(size.price);
    }

    let modifiersTotal = 0;
    const modifiersData = [];

    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modifier = product.modifiers.find((m) => m.id === mod.modifierId);
        modifiersTotal += Number(modifier.extraPrice);
        modifiersData.push({
          modifierId: mod.modifierId,
          extraPrice: modifier.extraPrice,
        });
      }
    }

    const totalPrice = (unitPrice + modifiersTotal) * item.quantity;
    subtotal += totalPrice;

    orderItemsData.push({
      productId: item.productId,
      productSizeId: item.productSizeId || null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      modifiers: {
        create: modifiersData,
      },
    });
  }

  const deliveryFee = deliveryType === "DELIVERY" ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.create({
      data: {
        userId,
        addressId: deliveryType === "DELIVERY" ? addressId : null,
        deliveryType,
        status: "PENDING",
        subtotal,
        deliveryFee,
        total,
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            productSize: true,
            modifiers: {
              include: { modifier: true },
            },
          },
        },
        payment: true,
      },
    });
  });

  return order;
};

const updateOrderStatus = async (id, status) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Pedido no encontrado");
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const newIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (newIndex === -1) {
    throw new AppError(400, "VALIDATION_ERROR", `Estado invalido: ${status}`);
  }

  if (newIndex <= currentIndex) {
    throw new AppError(400, "VALIDATION_ERROR", "No se puede retroceder a un estado anterior");
  }

  return orderRepository.updateStatus(id, status);
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus };
