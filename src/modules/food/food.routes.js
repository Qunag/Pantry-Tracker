// src/modules/food/food.routes.js

const { Router } = require("express");
const foodController = require("./food.controller");
const authenticate = require("../../middlewares/auth.middleware");

const router = Router();

// Tất cả routes đều cần auth
router.use(authenticate);

// QUAN TRỌNG: /stats phải đặt TRƯỚC /:id
// Nếu không, Express sẽ hiểu "stats" là một :id
router.get("/stats", foodController.getStats);

router.get("/", foodController.getFoods);
router.post("/", foodController.createFood);
router.put("/:id", foodController.updateFood);
router.delete("/:id", foodController.deleteFood);

module.exports = router;
