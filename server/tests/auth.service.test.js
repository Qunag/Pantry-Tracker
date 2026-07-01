// tests/auth.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/config/db.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create:     vi.fn(),
      update:     vi.fn(),
    },
    refreshToken: {
      create:     vi.fn(),
      findUnique: vi.fn(),
      delete:     vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn(),
    compare: vi.fn(),
  },
  hash:    vi.fn(),
  compare: vi.fn(),
}));

import prismaModule from "../src/config/db.js";
import bcrypt       from "bcryptjs";
import * as authService from "../src/modules/auth/auth.service.js";

const prisma = prismaModule;

// ──────────────────────────────────────────────
describe("authService.register()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 409 nếu email đã tồn tại", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: "exists@test.com" });

    await expect(
      authService.register({ name: "Test", email: "exists@test.com", password: "123456" })
    ).rejects.toMatchObject({ statusCode: 409, message: "Email already in use" });
  });

  it("trả về accessToken + refreshToken khi đăng ký thành công", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_password");
    prisma.user.create.mockResolvedValue({ id: "u1", email: "new@test.com", name: "Test" });
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.register({
      name: "Test", email: "new@test.com", password: "123456",
    });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(typeof result.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
  });
});

// ──────────────────────────────────────────────
describe("authService.login()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 401 nếu user không tồn tại", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({ email: "ghost@test.com", password: "123456" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 nếu sai mật khẩu", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: "test@test.com", password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: "test@test.com", password: "wrong" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("trả về accessToken + refreshToken khi login thành công", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1", email: "test@test.com", name: "Test", password: "hashed",
    });
    bcrypt.compare.mockResolvedValue(true);
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await authService.login({ email: "test@test.com", password: "123456" });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });
});

// ──────────────────────────────────────────────
describe("authService.changePassword()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 nếu mật khẩu hiện tại sai", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", password: "hashed_old" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.changePassword("u1", { currentPassword: "wrong", newPassword: "newpass123" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 404 nếu user không tồn tại", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.changePassword("ghost", { currentPassword: "any", newPassword: "new123" })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("hash mật khẩu mới và cập nhật thành công", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", password: "hashed_old" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashed_new");
    prisma.user.update.mockResolvedValue({});

    const result = await authService.changePassword("u1", {
      currentPassword: "correct", newPassword: "newpass123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
    expect(result).toHaveProperty("message");
  });
});
