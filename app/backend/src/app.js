const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./shared/middlewares/error-handler.middleware");

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Coffee Vibes API running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require("./modules/auth/auth.routes");
const catalogRoutes = require("./modules/catalog/catalog.routes");
const categoryRoutes = require("./modules/catalog/category.routes");
const addressRoutes = require("./modules/addresses/address.routes");
const orderRoutes = require("./modules/orders/order.routes");
const paymentRoutes = require("./modules/payments/payment.routes");

app.use("/api/auth", authRoutes);
app.use("/api/products", catalogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);


app.use(errorHandler);

module.exports = app;


