// src/config/swagger.js

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🍎 Food Expiry Tracker API",
      version: "1.0.0",
      description:
        "RESTful API quản lý hạn sử dụng thực phẩm. Hỗ trợ xác thực JWT, CRUD thực phẩm, lọc theo trạng thái và gửi email cảnh báo tự động.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập accessToken lấy từ /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Quang" },
            email: { type: "string", format: "email", example: "quang@test.com" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Food: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Sữa tươi TH" },
            barcode: { type: "string", nullable: true, example: "8934563118037" },
            quantity: { type: "integer", example: 2 },
            unit: { type: "string", nullable: true, example: "hộp" },
            expiryDate: { type: "string", format: "date-time" },
            imageUrl: { type: "string", nullable: true },
            status: { type: "string", enum: ["safe", "warning", "expired"] },
            daysLeft: { type: "integer", example: 34 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Stats: {
          type: "object",
          properties: {
            total: { type: "integer" },
            safe: { type: "integer" },
            warning: { type: "integer" },
            expired: { type: "integer" },
          },
        },
        AuthToken: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
  },
  // Quét tất cả file routes để lấy JSDoc comments
  apis: ["./src/modules/**/*.routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
