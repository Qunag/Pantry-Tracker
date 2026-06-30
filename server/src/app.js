// src/app.js

require("dotenv/config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const foodRoutes = require("./modules/food/food.routes");
const { runManually } = require("./jobs/expiry.cron");

const app = express();

// --- Security ---
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000"],
  credentials: true,
}));

// Rate limiting — 100 requests / 15 phút cho tất cả routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Auth routes bị giới hạn chặt hơn: 10 requests / 15 phút (chống brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

app.use(globalLimiter);

// --- Global Middleware ---
app.use(express.json());

// --- Swagger UI ---
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "🍎 Food Expiry Tracker API",
    customCss: ".swagger-ui .topbar { background-color: #e74c3c; }",
    swaggerOptions: { persistAuthorization: true }, // giữ token khi reload
  })
);

// Endpoint trả về raw JSON spec (dùng cho Postman import)
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// --- Routes ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/foods", foodRoutes);

// --- Dev: trigger cron thủ công ---
app.get("/api/test/cron", async (req, res, next) => {
  try {
    await runManually();
    res.json({ success: true, message: "Cron job executed. Check console for email preview link." });
  } catch (err) {
    next(err);
  }
});

// --- Health check ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Food Expiry Tracker API is running!",
    docs: "http://localhost:3000/api/docs",
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- Error Handler (phải đặt CUỐI CÙNG) ---
app.use(errorHandler);

module.exports = app;
