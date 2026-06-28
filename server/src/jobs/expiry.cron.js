// src/jobs/expiry.cron.js

const cron = require("node-cron");
const prisma = require("../config/db");
const { sendExpiryEmail } = require("../utils/mailer");

const startExpiryCron = () => {
  // Chạy lúc 7:00 sáng mỗi ngày
  cron.schedule("0 7 * * *", async () => {
    console.log("\n⏰ [CRON] Checking expiry foods...");

    try {
      // 1. Tìm tất cả foods hết hạn trong 3 ngày tới
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringFoods = await prisma.food.findMany({
        where: {
          expiryDate: { lte: threeDaysFromNow },
        },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { expiryDate: "asc" },
      });

      if (expiringFoods.length === 0) {
        console.log("   ✅ No expiring foods found.");
        return;
      }

      // 2. Group theo userId
      const grouped = {};
      for (const food of expiringFoods) {
        const userId = food.userId;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: food.user,
            foods: [],
          };
        }
        grouped[userId].foods.push(food);
      }

      // 3. Gửi 1 email tổng hợp cho mỗi user
      const userIds = Object.keys(grouped);
      console.log(`   📋 Found ${expiringFoods.length} items for ${userIds.length} user(s)`);

      for (const userId of userIds) {
        const { user, foods } = grouped[userId];
        try {
          await sendExpiryEmail(user.email, user.name, foods);
          console.log(`   ✅ Email sent to ${user.email} (${foods.length} items)`);
        } catch (err) {
          console.error(`   ❌ Failed to send email to ${user.email}:`, err.message);
        }
      }

      console.log("⏰ [CRON] Done.\n");
    } catch (err) {
      console.error("❌ [CRON] Error:", err.message);
    }
  });

  console.log("⏰ Cron job scheduled: daily at 7:00 AM");
};

// Chạy thủ công để test (không cần chờ 7h sáng)
const runManually = async () => {
  console.log("\n🔧 [MANUAL] Running expiry check...");

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringFoods = await prisma.food.findMany({
    where: {
      expiryDate: { lte: threeDaysFromNow },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { expiryDate: "asc" },
  });

  if (expiringFoods.length === 0) {
    console.log("   ✅ No expiring foods found.");
    return;
  }

  const grouped = {};
  for (const food of expiringFoods) {
    const userId = food.userId;
    if (!grouped[userId]) {
      grouped[userId] = { user: food.user, foods: [] };
    }
    grouped[userId].foods.push(food);
  }

  for (const userId of Object.keys(grouped)) {
    const { user, foods } = grouped[userId];
    try {
      await sendExpiryEmail(user.email, user.name, foods);
      console.log(`   ✅ Email sent to ${user.email} (${foods.length} items)`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  console.log("🔧 [MANUAL] Done.\n");
};

module.exports = { startExpiryCron, runManually };
