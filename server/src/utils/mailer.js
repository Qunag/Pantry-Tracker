// src/utils/mailer.js

const nodemailer = require("nodemailer");

let transporter = null;

// Khởi tạo transporter (gọi 1 lần khi server start)
const initMailer = async () => {
  // Nếu đã cấu hình EMAIL_HOST trong .env → dùng config thật
  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("📧 Mailer: using configured SMTP");
  } else {
    // Không cấu hình → tạo Ethereal test account tự động
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📧 Mailer: using Ethereal (fake SMTP for dev)");
    console.log(`   User: ${testAccount.user}`);
  }
};

// Gửi email cảnh báo hết hạn cho 1 user
const sendExpiryEmail = async (userEmail, userName, foods) => {
  if (!transporter) await initMailer();

  // Tạo danh sách HTML cho email
  const foodRows = foods
    .map((food) => {
      const daysLeft = Math.ceil(
        (new Date(food.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      const color = daysLeft <= 0 ? "#e74c3c" : "#f39c12"; // đỏ nếu hết hạn, vàng nếu sắp hết
      const label = daysLeft <= 0 ? "HẾT HẠN" : `còn ${daysLeft} ngày`;

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${food.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${food.quantity} ${food.unit || ""}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(food.expiryDate).toLocaleDateString("vi-VN")}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${color}; font-weight: bold;">${label}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">⚠️ Cảnh báo thực phẩm sắp hết hạn</h2>
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Bạn có <strong>${foods.length}</strong> thực phẩm cần chú ý:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 8px; text-align: left;">Tên</th>
            <th style="padding: 8px; text-align: left;">Số lượng</th>
            <th style="padding: 8px; text-align: left;">Hạn SD</th>
            <th style="padding: 8px; text-align: left;">Trạng thái</th>
          </tr>
        </thead>
        <tbody>${foodRows}</tbody>
      </table>
      <p style="color: #888; font-size: 12px;">— Food Expiry Tracker</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Food Expiry Tracker <noreply@foodtracker.com>",
    to: userEmail,
    subject: `🍎 ${foods.length} thực phẩm sắp hết hạn!`,
    html,
  });

  // Ethereal: in link xem email preview
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   📩 Preview: ${previewUrl}`);
  }

  return info;
};

module.exports = { initMailer, sendExpiryEmail };
