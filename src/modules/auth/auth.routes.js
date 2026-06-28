// src/modules/auth/auth.routes.js

const { Router } = require("express");
const authController = require("./auth.controller");
const authenticate = require("../../middlewares/auth.middleware");

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route
router.get("/me", authenticate, authController.getMe);

module.exports = router;
