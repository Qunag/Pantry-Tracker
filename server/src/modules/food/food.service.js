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

// Helper: tính ngưỡng ngày để filter status ngay trong DB query
const getStatusDateBounds = (status) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // bắt đầu ngày hôm nay (00:00:00)
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  if (status === "expired") {
    // expiryDate < today (đã hết hạn)
    return { expiryDate: { lt: today } };
  }
  if (status === "warning") {
    // today <= expiryDate <= today+3 (sắp hết hạn)
    return { expiryDate: { gte: today, lte: in3Days } };
  }
  if (status === "safe") {
    // expiryDate > today+3 (còn an toàn)
    return { expiryDate: { gt: in3Days } };
  }
  return {};
};

// --- GET ALL FOODS (với pagination + search + status filter trong DB) ---
const getFoods = async (userId, { status, search, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Build where clause — status filter được thực hiện ngay trong DB query
  const where = {
    userId,
    ...(search && {
      name: { contains: search, mode: "insensitive" }, // case-insensitive search
    }),
    ...(status && getStatusDateBounds(status)),
  };

  // Lấy total count cho pagination (đã tính đúng sau khi filter status)
  const total = await prisma.food.count({ where });

  const foods = await prisma.food.findMany({
    where,
    orderBy: { expiryDate: "asc" },
    skip,
    take: limit,
  });

  const formatted = foods.map(formatFood);

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

// --- STATS — dùng DB aggregation (groupBy date bounds) thay vì load all ---
const getStats = async (userId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  // Chạy song song 4 query COUNT thay vì load toàn bộ records
  const [total, expired, warning, safe] = await Promise.all([
    prisma.food.count({ where: { userId } }),
    prisma.food.count({ where: { userId, expiryDate: { lt: today } } }),
    prisma.food.count({ where: { userId, expiryDate: { gte: today, lte: in3Days } } }),
    prisma.food.count({ where: { userId, expiryDate: { gt: in3Days } } }),
  ]);

  return { total, expired, warning, safe };
};

module.exports = { getFoods, createFood, updateFood, deleteFood, getStats };
