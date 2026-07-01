// src/modules/auth/auth.controller.js

const { z } = require("zod");
const authService = require("./auth.service");
const { refreshAccessToken, revokeToken } = require("./token.service");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json({ success: true, ...result });
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

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json({ success: true, ...result });
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

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    });
    const { name } = schema.parse(req.body);
    const user = await authService.updateProfile(req.user.id, { name });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    next(err);
  }
};

// PUT /api/auth/password
const changePassword = async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
      newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    });
    const data = schema.parse(req.body);
    const result = await authService.changePassword(req.user.id, data);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    next(err);
  }
};

// POST /api/auth/refresh — dùng refresh token để lấy cặp token mới
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, ...tokens });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout — thu hồi refresh token
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await revokeToken(refreshToken);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, refresh, logout };
