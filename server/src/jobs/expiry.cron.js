// src/jobs/expiry.cron.js

const cron = require("node-cron");
const prisma = require("../config/db");
const logger = require("../config/logger");
const { sendExpiryEmail } = require("../utils/mailer");

const startExpiryCron = () => {
  // Chạy lúc 7:00 sáng mỗi ngày
  cron.schedule("0 7 * * *", async () => {
    logger.info("[CRON] Checking expiry foods...");
    try {
      await _runExpiryCheck();
      logger.info("[CRON] Done.");
    } catch (err) {
      logger.error("[CRON] Unexpected error", { error: err.message, stack: err.stack });
    }
  });

  logger.info("Cron job scheduled: daily at 7:00 AM");
};

// Tách logic ra hàm riêng để tái dụng + test
const _runExpiryCheck = async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringFoods = await prisma.food.findMany({
    where: { expiryDate: { lte: threeDaysFromNow } },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { expiryDate: "asc" },
  });

  if (expiringFoods.length === 0) {
    logger.info("[CRON] No expiring foods found.");
    return;
  }

  // Group theo userId
  const grouped = {};
  for (const food of expiringFoods) {
    if (!grouped[food.userId]) {
      grouped[food.userId] = { user: food.user, foods: [] };
    }
    grouped[food.userId].foods.push(food);
  }

  const userIds = Object.keys(grouped);
  logger.info(`[CRON] Found ${expiringFoods.length} items for ${userIds.length} user(s)`);

  for (const userId of userIds) {
    const { user, foods } = grouped[userId];
    try {
      await sendExpiryEmail(user.email, user.name, foods);
      logger.info(`[CRON] Email sent to ${user.email}`, { count: foods.length });
    } catch (err) {
      logger.error(`[CRON] Failed to send email to ${user.email}`, { error: err.message });
    }
  }
};

// Chạy thủ công để test (không cần chờ 7h sáng)
const runManually = async () => {
  logger.info("[MANUAL] Running expiry check...");
  await _runExpiryCheck();
  logger.info("[MANUAL] Done.");
};

module.exports = { startExpiryCron, runManually };
