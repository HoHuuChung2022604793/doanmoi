const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Nếu chưa cấu hình SMTP, log ra console thay vì gửi email
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password') {
    console.log('⚠️  EMAIL SMTP chưa được cấu hình. Hiển thị nội dung email tại console:');
    console.log('📧 To:', options.email);
    console.log('📧 Subject:', options.subject);
    console.log('📧 Message:', options.message);
    console.log('---');
    return; // Không throw error, coi như gửi thành công
  }

  // Tạo transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  // Định nghĩa email
  const mailOptions = {
    from: `Chung Mobile <${process.env.EMAIL_FROM || emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Gửi email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
