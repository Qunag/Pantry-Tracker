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

// Thêm status vào food object
const formatFood = (food) => ({
  ...food,
  ...calcStatus(food.expiryDate),
});

// --- GET ALL FOODS ---
const getFoods = async (userId, statusFilter) => {
  const foods = await prisma.food.findMany({
    where: { userId },
    orderBy: { expiryDate: "asc" }, // sắp xếp gần hết hạn lên đầu
  });

  const formatted = foods.map(formatFood);

  // Filter theo status nếu có query ?status=expired|warning|safe
  if (statusFilter) {
    return formatted.filter((f) => f.status === statusFilter);
  }

  return formatted;
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
  // Kiểm tra food thuộc về user này
  const existing = await prisma.food.findFirst({
    where: { id: foodId, userId },
  });

  if (!existing) {
    const error = new Error("Food not found");
    error.statusCode = 404;
    throw error;
  }

  const food = await prisma.food.update({
    where: { id: foodId },
    data,
  });

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
