import "dotenv/config";
import jwt from "jsonwebtoken";
import db from "../models/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })
}

export function roleAuth(allowed: string[]) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.authenticatedUser.id;
      const row = await db.query(`SELECT role FROM "users" WHERE id=$1`, [userId]);

      if (!row.rowCount)
        return res.status(401).json({ error: "Unauthorized" }); // ยังไม่ล็อกอิน

      if (!allowed.includes(row.rows[0].role))
        return res.status(403).json({ error: "Forbidden" }); // ไม่มีสิทธิ์ ยศไม่ถึง

      next();
    } catch {
      return res.status(500).json({ error: "Internal error" });
    }
  };
}

// เพิ่มฟังก์ชันนี้เพื่อให้ controller เรียกใช้ง่าย ๆ
export async function authenticateFetchRequest(request: any) {
  try {
    // อ่าน header (รองรับ Fetch Request Headers และ Express-like)
    let authorizationHeader = '';
    if (request && request.headers) {
      if (typeof request.headers.get === 'function') {
        authorizationHeader = request.headers.get('authorization') || '';
      } else if (typeof request.headers.authorization === 'string') {
        authorizationHeader = request.headers.authorization;
      }
    }

    const [schema, rawToken] = (authorizationHeader || '').split(' ');
    if (schema !== 'Bearer' || !rawToken) {
      return { ok: false, status: 401, body: { error: 'Unauthorized' } };
    }

    const decoded = jwt.verify(rawToken, JWT_SECRET) as jwt.JwtPayload;
    const users = await db.query(
      `SELECT id, email, name, surname, telephone, token, role FROM "users" WHERE id=$1`,
      [decoded.sub]
    );

    if (users.rowCount === 0) return { ok: false, status: 401, body: { error: 'Unauthorized' } };
    if (users.rows[0].token !== rawToken) return { ok: false, status: 401, body: { error: 'Unauthorized' } };

    const user = {
      id: users.rows[0].id,
      email: users.rows[0].email,
      role: users.rows[0].role
    };

    return { ok: true, user };
  } catch {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } };
  }
}

export async function jwtAuth(request: any, response: any, next: any) {
  try {
    let authorizationHeader = '';
    if (request && request.headers) {
      if (typeof request.headers.get === 'function') {
        authorizationHeader = request.headers.get('authorization') || '';
      } else if (typeof request.headers.authorization === 'string') {
        authorizationHeader = request.headers.authorization;
      }
    }

    const [schema, rawToken] = (authorizationHeader || '').split(' ');

    if (schema !== 'Bearer' || !rawToken)
      return response.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(rawToken, JWT_SECRET) as jwt.JwtPayload;
    const users = await db.query(`SELECT id, email, name, surname, telephone, token, role FROM "users" WHERE id=$1`, [decoded.sub]);

    if (users.rowCount === 0)
      return response.status(401).json({ error: 'Unauthorized' });
    if (users.rows[0].token !== rawToken)
      return response.status(401).json({ error: 'Unauthorized' });

    request.authenticatedUser = {
      id: users.rows[0].id,
      email: users.rows[0].email,
      role: users.rows[0].role
    };
    next();
  } catch {
    return response.status(401).json({ error: 'Unauthorized' });
  }
}

export default {
  generateToken,
  jwtAuth,
  roleAuth,
  authenticateFetchRequest
}