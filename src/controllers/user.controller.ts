import { updateUserProfile,uploadUserAvatar, getUserAvatar } from "../services/user.service";
import { verifyToken } from "../middleware/auth";
import { withCORS } from "../utils/cors";

export async function handleUserRoutes(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // ตรวจสอบ token
    const user = verifyToken(req);
    if (!user) return withCORS(Response.json({ result: "Unauthorized" }, { status: 401 }));

    // แก้ไขข้อมูลผู้ใช้
    if (url.pathname === "/api/user/update" && req.method === "POST") {
        const body = await req.json();
        if (!user.email) {
            return withCORS(Response.json({ result: "Email not found" }, { status: 400 }));
        }
        const result = await updateUserProfile(user.email, body);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // อัพโหลดรูปโปรไฟล์
    if (url.pathname === "/api/user/avatar" && req.method === "POST") {
        const formData = await req.formData();
        const file = formData.get("avatar");
        if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
            return withCORS(Response.json({ result: "Invalid file" }, { status: 400 }));
        }
        if (!user.email) {
            return withCORS(Response.json({ result: "Email not found" }, { status: 400 }));
        }
        const result = await uploadUserAvatar(user.email, file as Blob);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // ดึง url รูปโปรไฟล์
    if (url.pathname === "/api/user/avatar" && req.method === "GET") {
        if (!user.email) {
            return withCORS(Response.json({ result: "Email not found" }, { status: 400 }));
        }
        const result = await getUserAvatar(user.email);
        return withCORS(Response.json({ result }, { status: result.status }));
    }


    return new Response("Not found", { status: 404 });
}