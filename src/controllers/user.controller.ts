import { updateUserProfile, uploadUserAvatar, getUserAvatar, getAllUsers, getUserInfo, userRemove, userUnremove } from "../services/user.service";
import { authenticateFetchRequest } from "../utils/jwt";
import { withCORS } from "../utils/cors";

export async function handleUserRoutes(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Authenticate user Engine. Don't change. 
    // ตรวจสอบ token ผ่าน helper เดียว
    const auth = await authenticateFetchRequest(req as any);
    if (!auth.ok) return withCORS(Response.json(auth.body, { status: auth.status }));
    const user = auth.user!;


    // แสดงรายชื่อผู้ใช้ (เฉพาะ admin)
    if (url.pathname === "/api/user/list" && req.method === "GET") {
        if (user.role !== "admin") {
            return withCORS(Response.json({ result: "Forbidden" }, { status: 403 }));
        }
        const result = await getAllUsers();
        return withCORS(Response.json({ result }, { status: result.status }));
    }
    
    // ดึงข้อมูลผู้ใช้
    if (url.pathname === "/api/user/info" && req.method === "GET") {
        if (!user.id) {
            return withCORS(Response.json({ result: "User ID not found" }, { status: 400 }));
        }
        const result = await getUserInfo(user.id);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // ลบผู้ใช้ (soft remove)
    if (url.pathname === "/api/user/remove" && req.method === "POST") {
        const body = await req.json();
        if (!body.id) {
            return withCORS(Response.json({ result: "User ID required" }, { status: 400 }));
        }
        // เฉพาะ admin เท่านั้น
        if (user.role !== "admin") {
            return withCORS(Response.json({ result: "Forbidden" }, { status: 403 }));
        }
        const result = await userRemove(body.id);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // คืนค่าผู้ใช้ (unremove)
    if (url.pathname === "/api/user/unremove" && req.method === "POST") {
        const body = await req.json();
        if (!body.id) {
            return withCORS(Response.json({ result: "User ID required" }, { status: 400 }));
        }
        // เฉพาะ admin เท่านั้น
        if (user.role !== "admin") {
            return withCORS(Response.json({ result: "Forbidden" }, { status: 403 }));
        }
        const result = await userUnremove(body.id);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // แก้ไขข้อมูลผู้ใช้
    if (url.pathname === "/api/user/update" && req.method === "POST") {
        const body = await req.json();
        if (!user.id) {
            return withCORS(Response.json({ result: "User ID not found" }, { status: 400 }));
        }
        const result = await updateUserProfile(user.id, body);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // อัพโหลดรูปโปรไฟล์
    if (url.pathname === "/api/user/avatar" && req.method === "POST") {
        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        if (!file) {
            return withCORS(Response.json({ result: "Invalid file" }, { status: 400 }));
        }

        const checkFile = file.type.includes("png") || file.type.includes("jpeg") || file.type.includes("jpg");
        if (!checkFile) {
            return withCORS(Response.json({ result: "File is not an image" }, { status: 400 }));
        }

        if (!user.id) {
            return withCORS(Response.json({ result: "User ID not found" }, { status: 400 }));
        }
        const result = await uploadUserAvatar(user.id, file as Blob);
        return withCORS(Response.json({ result }, { status: result.status }));
    }

    // ดึง url รูปโปรไฟล์
    if (url.pathname === "/api/user/avatar" && req.method === "GET") {
        if (!user.id) {
            return withCORS(Response.json({ result: "User ID not found" }, { status: 400 }));
        }
        const result = await getUserAvatar(user.id);
        return withCORS(Response.json({ result }, { status: result.status }));
    }


    return new Response("Not found", { status: 404 });
}