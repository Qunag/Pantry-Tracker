// tests/food.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock toàn bộ module db.js trước khi import service
vi.mock("../src/config/db.js", () => {
  return {
    default: {
      food: {
        count:     vi.fn(),
        findMany:  vi.fn(),
        findFirst: vi.fn(),
        create:    vi.fn(),
        update:    vi.fn(),
        delete:    vi.fn(),
        groupBy:   vi.fn(),
      },
    },
  };
});

// Import SAU khi mock đã được đăng ký
import prismaModule from "../src/config/db.js";
import * as foodService from "../src/modules/food/food.service.js";

const prisma = prismaModule;

// ──────────────────────────────────────────────
describe("foodService — calcStatus (via getFoods)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("trả về status=expired nếu đã qua hạn", async () => {
    const past = new Date(Date.now() - 2 * 86400000).toISOString();
    prisma.food.count.mockResolvedValue(1);
    prisma.food.findMany.mockResolvedValue([
      { id: "f1", name: "Sữa", category: "dairy", expiryDate: past, quantity: 1 },
    ]);

    const result = await foodService.getFoods("u1", { page: 1, limit: 10 });
    expect(result.data[0].status).toBe("expired");
    expect(result.data[0].daysLeft).toBeLessThanOrEqual(0);
  });

  it("trả về status=warning nếu còn ≤ 3 ngày", async () => {
    const soon = new Date(Date.now() + 2 * 86400000).toISOString();
    prisma.food.count.mockResolvedValue(1);
    prisma.food.findMany.mockResolvedValue([
      { id: "f2", name: "Thịt", category: "meat", expiryDate: soon, quantity: 2 },
    ]);

    const result = await foodService.getFoods("u1", { page: 1, limit: 10 });
    expect(result.data[0].status).toBe("warning");
  });

  it("trả về status=safe nếu còn > 3 ngày", async () => {
    const safe = new Date(Date.now() + 10 * 86400000).toISOString();
    prisma.food.count.mockResolvedValue(1);
    prisma.food.findMany.mockResolvedValue([
      { id: "f3", name: "Gạo", category: "dry", expiryDate: safe, quantity: 5 },
    ]);

    const result = await foodService.getFoods("u1", { page: 1, limit: 10 });
    expect(result.data[0].status).toBe("safe");
  });
});

// ──────────────────────────────────────────────
describe("foodService.getFoods()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("trả về đúng cấu trúc pagination", async () => {
    prisma.food.count.mockResolvedValue(25);
    prisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getFoods("u1", { page: 2, limit: 10 });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("pagination");
    expect(result.pagination).toMatchObject({
      page: 2, limit: 10, total: 25, totalPages: 3,
    });
  });

  it("map đúng category và fields", async () => {
    const date = new Date(Date.now() + 20 * 86400000).toISOString();
    prisma.food.count.mockResolvedValue(1);
    prisma.food.findMany.mockResolvedValue([{
      id: "f1", name: "Cà chua", category: "vegetable",
      expiryDate: date, quantity: 3, unit: "kg",
    }]);

    const result = await foodService.getFoods("u1", { page: 1, limit: 10 });
    expect(result.data[0]).toMatchObject({
      id: "f1", name: "Cà chua", category: "vegetable", status: "safe",
    });
    expect(result.data[0].daysLeft).toBeGreaterThan(3);
  });
});

// ──────────────────────────────────────────────
describe("foodService.deleteFood()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 404 nếu food không tồn tại hoặc không thuộc user", async () => {
    prisma.food.findFirst.mockResolvedValue(null);

    await expect(
      foodService.deleteFood("u1", "nonexistent-id")
    ).rejects.toMatchObject({ statusCode: 404, message: "Food not found" });
  });

  it("xóa thành công và trả về message", async () => {
    prisma.food.findFirst.mockResolvedValue({ id: "f1", userId: "u1" });
    prisma.food.delete.mockResolvedValue({});

    const result = await foodService.deleteFood("u1", "f1");
    expect(result).toHaveProperty("message");
    expect(prisma.food.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
  });
});

// ──────────────────────────────────────────────
describe("foodService.getStats()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("trả về đúng cấu trúc {total, safe, warning, expired}", async () => {
    prisma.food.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5);

    const stats = await foodService.getStats("u1");

    expect(stats).toEqual({ total: 10, expired: 2, warning: 3, safe: 5 });
    expect(prisma.food.count).toHaveBeenCalledTimes(4);
  });
});
