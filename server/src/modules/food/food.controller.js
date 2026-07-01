// src/modules/food/food.controller.js

const { z } = require("zod");
const foodService = require("./food.service");

const VALID_CATEGORIES = ["vegetable", "meat", "frozen", "dairy", "dry", "drink", "other"];

// Schema validation
const foodSchema = z.object({
  name:      z.string().min(1, "Food name is required"),
  category:  z.enum(VALID_CATEGORIES).default("other"),
  barcode:   z.string().optional(),
  quantity:  z.number().int().positive().default(1),
  unit:      z.string().optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Use ISO 8601 (e.g. 2024-12-31)",
  }),
  imageUrl:  z.string().url().optional(),
});

const updateFoodSchema = foodSchema.partial();

// GET /api/foods?status=&search=&category=&sortBy=&sortOrder=&page=&limit=
const getFoods = async (req, res, next) => {
  try {
    const { status, search, category, sortBy, sortOrder, page, limit } = req.query;
    const result = await foodService.getFoods(req.user.id, {
      status,
      search,
      category,
      sortBy,
      sortOrder,
      page:  page  ? parseInt(page)  : 1,
      limit: limit ? parseInt(limit) : 10,
    });
    res.status(200).json({
      success: true,
      count: result.data.length,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/foods
const createFood = async (req, res, next) => {
  try {
    const data = foodSchema.parse(req.body);
    data.expiryDate = new Date(data.expiryDate);
    const food = await foodService.createFood(req.user.id, data);
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    next(err);
  }
};

// PUT /api/foods/:id
const updateFood = async (req, res, next) => {
  try {
    const data = updateFoodSchema.parse(req.body);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);
    const food = await foodService.updateFood(req.user.id, req.params.id, data);
    res.status(200).json({ success: true, data: food });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/foods/:id
const deleteFood = async (req, res, next) => {
  try {
    const result = await foodService.deleteFood(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await foodService.getStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/expiring — foods hết hạn trong 7 ngày (dùng cho Notification Bell)
const getExpiring = async (req, res, next) => {
  try {
    const foods = await foodService.getExpiringFoods(req.user.id);
    res.status(200).json({ success: true, count: foods.length, data: foods });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/stats/category — số lượng theo category (dùng cho CategoryChart)
const getCategoryStats = async (req, res, next) => {
  try {
    const data = await foodService.getStatsByCategory(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFoods, createFood, updateFood, deleteFood, getStats, getExpiring, getCategoryStats };
