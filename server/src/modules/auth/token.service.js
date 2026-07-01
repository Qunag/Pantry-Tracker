// src/modules/auth/token.service.js

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/db");
const logger = require("../../config/logger");

const ACCESS_TOKEN_EXPIRY  = "15m";
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 ngày (ms)

// Tạo Access Token (JWT, 15 phút)
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

// Tạo Refresh Token (opaque random string) và lưu vào DB
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
};

// Tạo cặp access + refresh token
const generateTokenPair = async (user) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);
  return { accessToken, refreshToken };
};

// Dùng refresh token để lấy access token mới
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error("Refresh token required");
    err.statusCode = 401;
    throw err;
  }

  // Tìm trong DB
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    throw err;
  }

  // Kiểm tra hết hạn
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const err = new Error("Refresh token expired");
    err.statusCode = 401;
    throw err;
  }

  // Rotate: xóa token cũ, tạo cặp mới (bảo mật hơn)
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const newPair = await generateTokenPair(stored.user);
  logger.info(`[TOKEN] Refreshed tokens for user ${stored.userId}`);
  return newPair;
};

// Thu hồi refresh token (khi logout)
const revokeToken = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
  } catch {
    // Token không tồn tại — bỏ qua (idempotent)
  }
};

// Thu hồi TẤT CẢ refresh tokens của user (force logout all devices)
const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// Dọn dẹp tokens hết hạn — chạy định kỳ
const cleanupExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (result.count > 0) {
    logger.info(`[TOKEN] Cleaned up ${result.count} expired refresh tokens`);
  }
};

module.exports = {
  generateTokenPair,
  refreshAccessToken,
  revokeToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
};
