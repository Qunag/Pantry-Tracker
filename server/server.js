// server.js

const app = require("./src/app");
const { initMailer } = require("./src/utils/mailer");
const { startExpiryCron } = require("./src/jobs/expiry.cron");

const PORT = process.env.PORT || 3000;

const start = async () => {
  // Khởi tạo mailer (Ethereal hoặc SMTP thật)
  await initMailer();

  // Đăng ký cron job
  startExpiryCron();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

start().catch(console.error);
