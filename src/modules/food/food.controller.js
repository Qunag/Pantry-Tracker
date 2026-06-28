// src/modules/food/food.controller.js

const { z } = require("zod");
const foodService = require("./food.service");

// Schema validation
const foodSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  barcode: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  unit: z.string().optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Use ISO 8601 (e.g. 2024-12-31)",
  }),
  imageUrl: z.string().url().optional(),
});

const updateFoodSchema = foodSchema.partial(); // tất cả field đều optional khi update

// GET /api/foods?status=safe|warning|expired&search=sữa&page=1&limit=10
const getFoods = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await foodService.getFoods(req.user.id, {
      status,
      search,
      page: page ? parseInt(page) : 1,
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
    // Convert expiryDate string → Date object
    data.expiryDate = new Date(data.expiryDate);
    const food = await foodService.createFood(req.user.id, data);
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
      });
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
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
      });
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

module.exports = { getFoods, createFood, updateFood, deleteFood, getStats };
