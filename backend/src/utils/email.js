const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    ...options
  };
  return transporter.sendMail(mailOptions);
};
