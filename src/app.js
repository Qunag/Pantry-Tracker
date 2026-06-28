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

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);

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
