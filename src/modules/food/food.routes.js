// src/modules/food/food.routes.js

const { Router } = require("express");
const foodController = require("./food.controller");
const authenticate = require("../../middlewares/auth.middleware");

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: Quản lý thực phẩm — CRUD và thống kê
 */

/**
 * @swagger
 * /api/foods/stats:
 *   get:
 *     summary: Thống kê số lượng thực phẩm theo trạng thái
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 */
router.get("/stats", foodController.getStats);

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: Lấy danh sách thực phẩm (có thể filter và phân trang)
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [safe, warning, expired]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên thực phẩm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số items mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách thực phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 */
router.get("/", foodController.getFoods);

/**
 * @swagger
 * /api/foods:
 *   post:
 *     summary: Thêm thực phẩm mới
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, expiryDate]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sữa tươi TH
 *               barcode:
 *                 type: string
 *                 example: "8934563118037"
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *               unit:
 *                 type: string
 *                 example: hộp
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-15"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Thêm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Validation error
 */
router.post("/", foodController.createFood);

/**
 * @swagger
 * /api/foods/{id}:
 *   put:
 *     summary: Cập nhật thực phẩm
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               quantity: { type: integer }
 *               unit: { type: string }
 *               expiryDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.put("/:id", foodController.updateFood);

/**
 * @swagger
 * /api/foods/{id}:
 *   delete:
 *     summary: Xóa thực phẩm
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.delete("/:id", foodController.deleteFood);

module.exports = router;
