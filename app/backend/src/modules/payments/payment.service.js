const prisma = require("../../config/database");
const env = require("../../config/env");
const AppError = require("../../shared/utils/app-error");
const paymentRepository = require("./payment.repository");

const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: env.mpAccessToken,
});

const createPreference = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          productSize: true,
          modifiers: { include: { modifier: true } },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Pedido no encontrado");
  }

  if (order.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para pagar este pedido");
  }

  if (order.status !== "PENDING") {
    throw new AppError(400, "INVALID_STATUS", "El pedido no esta pendiente de pago");
  }

  const items = order.items.map((item) => {
    const title = item.productSize
      ? `${item.product.name} - ${item.productSize.size}`
      : item.product.name;

    return {
      title,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: "PEN",
    };
  });

  if (Number(order.deliveryFee) > 0) {
    items.push({
      title: "Costo de envio",
      quantity: 1,
      unit_price: Number(order.deliveryFee),
      currency_id: "PEN",
    });
  }

  const preferenceData = {
    body: {
      items,
      external_reference: String(order.id),
      notification_url: `${env.frontendUrl}/api/payments/webhook`,
      back_urls: {
        success: `${env.frontendUrl}/orders/${order.id}/success`,
        failure: `${env.frontendUrl}/orders/${order.id}/failure`,
        pending: `${env.frontendUrl}/orders/${order.id}/pending`,
      },
      auto_return: "approved",
    },
  };

  try {
    const preference = new Preference(client);
    const response = await preference.create(preferenceData);
    const result = response;

    const existingPayment = await paymentRepository.findByOrderId(orderId);

    if (existingPayment) {
      await paymentRepository.updateByOrderId(orderId, {
        mpPreferenceId: result.id,
        amount: order.total,
      });
    } else {
      await paymentRepository.create({
        orderId,
        mpPreferenceId: result.id,
        amount: order.total,
      });
    }

    return {
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    };
  } catch (error) {
    throw new AppError(500, "PAYMENT_ERROR", "Error al crear la preferencia de pago");
  }
};

const handleWebhook = async (data) => {
  const { type, "data.id": dataId } = data;

  if (type !== "payment") {
    return;
  }

  try {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = parseInt(paymentData.external_reference);

    if (!orderId) {
      return;
    }

    const statusMap = {
      approved: "APPROVED",
      rejected: "REJECTED",
      refunded: "REFUNDED",
    };

    const paymentStatus = statusMap[paymentData.status] || "PENDING";

    await paymentRepository.updateByOrderId(orderId, {
      mpPaymentId: String(dataId),
      status: paymentStatus,
    });

    if (paymentData.status === "approved") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    }

    if (paymentData.status === "rejected") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
  }
};

const getPaymentByOrder = async (userId, orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Pedido no encontrado");
  }

  if (order.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para ver este pago");
  }

  const payment = await paymentRepository.findByOrderId(orderId);

  if (!payment) {
    throw new AppError(404, "NOT_FOUND", "Pago no encontrado");
  }

  return payment;
};

module.exports = { createPreference, handleWebhook, getPaymentByOrder };
