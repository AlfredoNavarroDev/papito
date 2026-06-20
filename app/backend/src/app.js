const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const errorHandler = require("./shared/middlewares/error-handler.middleware");

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Coffee Vibes API running" });
});

const authRoutes = require("./modules/auth/auth.routes");

app.use("/api/auth", authRoutes);

// app.use("/api/products", catalogRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/delivery", deliveryRoutes);
// app.use("/api/addresses", addressRoutes);

app.use(errorHandler);

module.exports = app;
