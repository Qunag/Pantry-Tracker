// src/modules/food/food.service.js

const prisma = require("../../config/db");

// Helper tính status từ expiryDate
const calcStatus = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return { status: "expired", daysLeft };
  if (daysLeft <= 3) return { status: "warning", daysLeft };
  return { status: "safe", daysLeft };
};

const formatFood = (food) => ({ ...food, ...calcStatus(food.expiryDate) });

// --- GET ALL FOODS (với pagination + search + status filter) ---
const getFoods = async (userId, { status, search, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    userId,
    ...(search && {
      name: { contains: search, mode: "insensitive" }, // case-insensitive search
    }),
  };

  // Lấy total count cho pagination
  const total = await prisma.food.count({ where });

  const foods = await prisma.food.findMany({
    where,
    orderBy: { expiryDate: "asc" },
    skip,
    take: limit,
  });

  let formatted = foods.map(formatFood);

  // Filter theo status (sau khi tính status từ date)
  if (status) {
    formatted = formatted.filter((f) => f.status === status);
  }

  return {
    data: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// --- CREATE FOOD ---
const createFood = async (userId, data) => {
  const food = await prisma.food.create({
    data: { ...data, userId },
  });
  return formatFood(food);
};

// --- UPDATE FOOD ---
const updateFood = async (userId, foodId, data) => {
  const existing = await prisma.food.findFirst({
    where: { id: foodId, userId },
  });

  if (!existing) {
    const error = new Error("Food not found");
    error.statusCode = 404;
    throw error;
  }

  const food = await prisma.food.update({ where: { id: foodId }, data });
  return formatFood(food);
};

// --- DELETE FOOD ---
const deleteFood = async (userId, foodId) => {
  const existing = await prisma.food.findFirst({
    where: { id: foodId, userId },
  });

  if (!existing) {
    const error = new Error("Food not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.food.delete({ where: { id: foodId } });
  return { message: "Food deleted successfully" };
};

// --- STATS ---
const getStats = async (userId) => {
  const foods = await prisma.food.findMany({ where: { userId } });
  const formatted = foods.map(formatFood);

  return {
    total: formatted.length,
    safe: formatted.filter((f) => f.status === "safe").length,
    warning: formatted.filter((f) => f.status === "warning").length,
    expired: formatted.filter((f) => f.status === "expired").length,
  };
};

module.exports = { getFoods, createFood, updateFood, deleteFood, getStats };
