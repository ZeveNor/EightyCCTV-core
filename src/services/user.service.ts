import db from "../models/db";
import { uploadToFirebase } from "../utils/uploadFirebase";

// แก้ไขข้อมูลผู้ใช้ โดย admin
export async function updateUserProfile(
  id: string,
  { name, surname, telephone, role }:
    { name?: string, surname?: string, telephone?: string, role?: string }
) {
  try {
    await db.query(
      `UPDATE "users" 
   SET name=$1, surname=$2, telephone=$3, role=$4 
   WHERE id=$5`,
      [name, surname, telephone, role, id]
    );
    return { status: 200, result: "User updated" };
  } catch (e) {
    console.error("Update error:", e);
    return { status: 400, result: "Update failed" };
  }
}
// แก้ไขข้อมูลผู้ใช้ โดย user
export async function updateProfile(id: string, { name, surname, telephone }: { name?: string, surname?: string, telephone?: string }) {
  try {
    await db.query(
      `UPDATE "users" SET name=$1, surname=$2, telephone=$3 WHERE id=$4`,
      [name, surname, telephone, id]
    );
    return { status: 200, result: "Profile updated" };
  } catch (e) {
    return { status: 400, result: "Update failed" };
  }
}
// ดึงข้อมูลผู้ใช้
export async function getUserInfo(id: string) {
  try {
    const res = await db.query(
      `SELECT id, name, surname, email, telephone, role FROM "users" WHERE id=$1`,
      [id]
    );
    if (res.rowCount === 0) return { status: 404, result: "User not found" };
    return { status: 200, result: res.rows[0] };
  } catch (e) {
    return { status: 400, result: "Get Info failed" };
  }
}

// แสดงรายชื่อผู้ใช้ (เฉพาะ admin)
export async function getAllUsers() {
  try {
    const res = await db.query(`SELECT id, name, surname, email, telephone, role, deleted_at FROM "users"  ORDER BY id`);
    return { status: 200, result: res.rows };
  } catch (e) {
    return { status: 400, result: "Get users failed" };
  }
}

// ลบผู้ใช้ (soft delete)
export async function userRemove(id: string) {
  try {
    await db.query(
      `UPDATE "users" SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );
    return { status: 200, result: "User soft removed" };
  } catch (e) {
    return { status: 400, result: "Remove failed" };
  }
}

// ยกเลิกremove (set deleted_at to null)
export async function userUnremove(id: string) {
  try {
    await db.query(
      `UPDATE "users" SET deleted_at = NULL WHERE id = $1`,
      [id]
    );
    return { status: 200, result: "User unremoved" };
  } catch (e) {
    return { status: 400, result: "Unremove failed" };
  }
}

// อัพโหลดรูปโปรไฟล์
export async function uploadUserAvatar(id: string, file: Blob) {
  try {
    const avatar_url = await uploadToFirebase(file);
    await db.query(
      `UPDATE "users" SET avatar_url=$1 WHERE id=$2`,
      [avatar_url, id]
    );
    return { status: 200, result: { avatar_url } };
  } catch {
    return { status: 400, result: "Upload failed" };
  }
}

// ดึง url รูปโปรไฟล์
export async function getUserAvatar(id: string) {
  try {
    const res = await db.query(
      `SELECT avatar_url FROM "users" WHERE id=$1`,
      [id]
    );
    if (res.rowCount === 0) return { status: 404, result: "User not found" };
    return { status: 200, result: { avatar_url: res.rows[0].avatar_url } };
  } catch {
    return { status: 400, result: "Get avatar failed" };
  }
}
