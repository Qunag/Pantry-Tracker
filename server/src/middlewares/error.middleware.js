// src/middlewares/error.middleware.js
const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log 5xx errors (lỗi server thật) với stack trace
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} → ${statusCode}`, {
      message,
      stack: err.stack,
      userId: req.user?.id,
    });
  } else {
    // 4xx errors chỉ log ở level warn (client lỗi, không phải server lỗi)
    logger.warn(`${req.method} ${req.path} → ${statusCode}: ${message}`, {
      userId: req.user?.id,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;