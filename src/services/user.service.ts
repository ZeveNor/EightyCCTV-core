import db from "../models/db";
import { uploadToFirebase } from "../utils/uploadFirebase";

// แก้ไขข้อมูลผู้ใช้
export async function updateUserProfile(email: string, { name, surname, telephone }: { name?: string, surname?: string, telephone?: string }) {
    try {
        await db.query(
            `UPDATE "users" SET name=$1, surname=$2, telephone=$3 WHERE email=$4`,
            [name, surname, telephone, email]
        );
        return { status: 200, result: "Profile updated" };
    } catch (e){
        return { status: 400, result: "Update failed" };
    }
}

// อัพโหลดรูปโปรไฟล์
export async function uploadUserAvatar(email: string, file: Blob) {
  try {
    const filename = `${email}_${Date.now()}.jpg`;
    const avatar_url = await uploadToFirebase(file, filename);
    await db.query(
      `UPDATE "users" SET avatar_url=$1 WHERE email=$2`,
      [avatar_url, email]
    );
    return { status: 200, result: { avatar_url } };
  } catch {
    return { status: 400, result: "Upload failed" };
  }
}

// ดึง url รูปโปรไฟล์
export async function getUserAvatar(email: string) {
  try {
    const res = await db.query(
      `SELECT avatar_url FROM "users" WHERE email=$1`,
      [email]
    );
    if (res.rowCount === 0) return { status: 404, result: "User not found" };
    return { status: 200, result: { avatar_url: res.rows[0].avatar_url } };
  } catch {
    return { status: 400, result: "Get avatar failed" };
  }
}
