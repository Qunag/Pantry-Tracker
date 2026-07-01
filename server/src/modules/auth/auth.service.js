// src/modules/auth/auth.service.js

const bcrypt = require("bcryptjs");
const prisma = require("../../config/db");
const { generateTokenPair } = require("./token.service");

// --- REGISTER ---
const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email already in use");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return generateTokenPair(user);
};

// --- LOGIN ---
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return generateTokenPair(user);
};

// --- GET ME ---
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// --- UPDATE PROFILE ---
const updateProfile = async (userId, { name }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return user;
};

// --- CHANGE PASSWORD ---
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Mật khẩu hiện tại không đúng");
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password changed successfully" };
};

module.exports = { register, login, getMe, updateProfile, changePassword };
