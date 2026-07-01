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

// Helper: chuyển status string → điều kiện ngày trong DB
const getStatusDateBounds = (status) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  if (status === "expired") return { expiryDate: { lt: today } };
  if (status === "warning") return { expiryDate: { gte: today, lte: in3Days } };
  if (status === "safe")    return { expiryDate: { gt: in3Days } };
  return {};
};

// Helper: parse sortBy/sortOrder → Prisma orderBy
const buildOrderBy = (sortBy = "expiryDate", sortOrder = "asc") => {
  const allowed = ["expiryDate", "name", "quantity", "createdAt"];
  const field = allowed.includes(sortBy) ? sortBy : "expiryDate";
  const order = sortOrder === "desc" ? "desc" : "asc";
  return { [field]: order };
};

// --- GET ALL FOODS (pagination + search + status + category + sort) ---
const getFoods = async (userId, { status, search, category, sortBy, sortOrder, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(search   && { name: { contains: search, mode: "insensitive" } }),
    ...(status   && getStatusDateBounds(status)),
    ...(category && { category }),
  };

  const [total, foods] = await Promise.all([
    prisma.food.count({ where }),
    prisma.food.findMany({
      where,
      orderBy: buildOrderBy(sortBy, sortOrder),
      skip,
      take: limit,
    }),
  ]);

  return {
    data: foods.map(formatFood),
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
  const food = await prisma.food.create({ data: { ...data, userId } });
  return formatFood(food);
};

// --- UPDATE FOOD ---
const updateFood = async (userId, foodId, data) => {
  const existing = await prisma.food.findFirst({ where: { id: foodId, userId } });
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
  const existing = await prisma.food.findFirst({ where: { id: foodId, userId } });
  if (!existing) {
    const error = new Error("Food not found");
    error.statusCode = 404;
    throw error;
  }
  await prisma.food.delete({ where: { id: foodId } });
  return { message: "Food deleted successfully" };
};

// --- STATS — 4 COUNT queries chạy song song ---
const getStats = async (userId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  const [total, expired, warning, safe] = await Promise.all([
    prisma.food.count({ where: { userId } }),
    prisma.food.count({ where: { userId, expiryDate: { lt: today } } }),
    prisma.food.count({ where: { userId, expiryDate: { gte: today, lte: in3Days } } }),
    prisma.food.count({ where: { userId, expiryDate: { gt: in3Days } } }),
  ]);

  return { total, expired, warning, safe };
};

// --- EXPIRING FOODS (trong 7 ngày tới + đã hết hạn) — dùng cho Notification Bell ---
const getExpiringFoods = async (userId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const foods = await prisma.food.findMany({
    where: {
      userId,
      expiryDate: { lte: in7Days }, // đã hết hạn hoặc sắp hết hạn trong 7 ngày
    },
    orderBy: { expiryDate: "asc" },
    take: 20, // giới hạn tối đa 20 items cho dropdown
  });

  return foods.map(formatFood);
};

// --- STATS BY CATEGORY — dùng cho CategoryChart ---
const getStatsByCategory = async (userId) => {
  const foods = await prisma.food.groupBy({
    by: ["category"],
    where: { userId },
    _count: { id: true },
  });

  return foods.map((f) => ({ category: f.category, count: f._count.id }));
};

module.exports = { getFoods, createFood, updateFood, deleteFood, getStats, getExpiringFoods, getStatsByCategory };
