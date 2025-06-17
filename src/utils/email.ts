import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // อีเมล Gmail ของคุณ
    pass: process.env.EMAIL_PASS, // รหัสผ่านแอป (App Password)
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"EightyCCTV" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}