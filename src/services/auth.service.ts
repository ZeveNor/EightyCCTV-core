import db from "../models/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ส่ง OTP ไปยังอีเมล
export async function sendOtp({ email }: { email: string }) {
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 นาที
    try {
        await db.query(
            `INSERT INTO otp (email, otp_code, expires_at) VALUES ($1, $2, $3)`,
            [email, otp_code, expires_at]
        );
        await sendMail(email, "Your OTP Code", `Your OTP code is: ${otp_code}`);
        return { status: 200, result: "OTP sent successfully" };
    } catch (e) {
        return { status: 400, result: "Failed to send OTP" };
    }
}

// ตรวจสอบ OTP
export async function verifyOtp({ email, otp_code }: { email: string; otp_code: string }) {
    try {
        const res = await db.query(
            `SELECT * FROM otp WHERE email=$1 AND otp_code=$2 AND expires_at > NOW() AND verified=FALSE ORDER BY expires_at DESC LIMIT 1`,
            [email, otp_code]
        );
        if (res.rowCount === 0) {
            return { status: 400, result: "Invalid or expired OTP" };
        }

        await db.query(`UPDATE otp SET verified=TRUE WHERE id=$1`, [res.rows[0].id]);
        return { status: 200, result: "OTP verified successfully" };
    } catch (e) {
        return { status: 400, result: "Failed to verify OTP" };
    }
}

// สมัครสมาชิก (ต้อง verify OTP ก่อน)
export async function register({
    name,
    surname,
    email,
    password,
    telephone,
}: {
    name: string;
    surname: string;
    email: string;
    password: string;
    telephone: string;
}) {
    try {
        // ตรวจสอบ email, telephone ซ้ำ
        const exists = await db.query(
            `SELECT 1 FROM "users" WHERE email=$1 OR telephone=$2`,
            [email, telephone]
        );
        if ((exists.rowCount??0) > 0) {
            return { status: 400, result: "Email or telephone already exists" };
        }

        // ตรวจสอบ OTP
        const otp = await db.query(
            `SELECT * FROM otp WHERE email=$1 AND verified=TRUE AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1`,
            [email]
        );
        if (otp.rowCount === 0) {
            return { status: 400, result: "OTP not verified" };
        }

        const hash = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email, telephone }, JWT_SECRET);

        await db.query(
            `INSERT INTO "users" (name, surname, email, password, telephone, token) VALUES ($1,$2,$3,$4,$5,$6)`,
            [name, surname, email, hash, telephone, token]
        );
        return { status: 200, result: "Registered successfully" };
    } catch (e) {
        return { status: 400, result: "Failed to register" };
    }
}

// เข้าสู่ระบบ
export async function login({ email, password }: { email: string; password: string }) {
    try {
        const users = await db.query(`SELECT * FROM "users" WHERE email=$1`, [email]);
        if (users.rowCount === 0) {
            return { status: 400, result: "Invalid credentials" };
        }

        const valid = await bcrypt.compare(password, users.rows[0].password);
        if (!valid) {
            return { status: 400, result: "Invalid credentials" };
        }

        const token = jwt.sign(
            { id: users.rows[0].id, email },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return {
            status: 200,
            result: "Login successful",
            data: {
                token,
                user: {
                    id: users.rows[0].id,
                    name: users.rows[0].name,
                    surname: users.rows[0].surname,
                    email: users.rows[0].email,
                    telephone: users.rows[0].telephone
                }
            }
        };
    } catch (e) {
        return { status: 400, result: "Failed to login" };
    }
}

// ขอเปลี่ยนรหัสผ่าน
export async function forgotPassword({ email }: { email: string }) {
    try {
        const users = await db.query(`SELECT * FROM "users" WHERE email=$1`, [email]);
        if (users.rowCount === 0) {
            return { status: 400, result: "Email not found" };
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "10m" });
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            `INSERT INTO forgot_password_token (email, token, expires_at) VALUES ($1,$2,$3)`,
            [email, token, expires_at]
        );

        await sendMail(email, "Reset Password", `Click here to reset: https://yourdomain/reset?token=${token}`);
        return { status: 200, result: "Reset link sent to email" };
    } catch (e) {
        return { status: 400, result: "Failed to send reset link" };
    }
}

// เปลี่ยนรหัสผ่านด้วย token
export async function resetPassword({ token, newPassword }: { token: string; newPassword: string; }) {
    try {
        const row = await db.query(
            `SELECT * FROM forgot_password_token WHERE token=$1 AND used=FALSE AND expires_at > NOW()`,
            [token]
        );
        if (row.rowCount === 0) {
            return { status: 400, result: "Invalid or expired token" };
        }

        const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        const email = payload.email;
        const hash = await bcrypt.hash(newPassword, 10);

        await db.query(`UPDATE "users" SET password=$1 WHERE email=$2`, [hash, email]);
        await db.query(`UPDATE forgot_password_token SET used=TRUE WHERE token=$1`, [token]);
        return { status: 200, result: "Password reset successful" };
    } catch (e) {
        return { status: 400, result: "Failed to reset password" };
    }
}
