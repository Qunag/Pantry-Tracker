// src/config/logger.js
const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

// Tạo thư mục logs nếu chưa có
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = format;

// Format cho console (dev) — màu sắc + dễ đọc
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${stack || message}${metaStr}`;
  })
);

// Format cho file — JSON thuần để dễ parse
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "warn" : "debug"),
  transports: [
    // Console — chỉ trong dev
    new transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === "test", // tắt log khi chạy test
    }),
    // File: chỉ errors
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    }),
    // File: tất cả logs
    new transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
