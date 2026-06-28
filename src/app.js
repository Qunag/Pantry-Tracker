// src/app.js

require("dotenv/config");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const foodRoutes = require("./modules/food/food.routes");

const app = express();

// --- Global Middleware ---
app.use(cors());
app.use(express.json());

const { runManually } = require("./jobs/expiry.cron");

// --- Routes ---
app.use("/api/auth", authRoutes);
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
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- Error Handler (phải đặt CUỐI CÙNG) ---
app.use(errorHandler);

module.exports = app;
