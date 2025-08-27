import { updateUserProfile, uploadUserAvatar, getUserAvatar } from "../services/user.service";
import { authenticateFetchRequest } from "../utils/jwt";
import { withCORS } from "../utils/cors";

export async function handleUserRoutes(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Authenticate user Engine. Don't change. 
    // ตรวจสอบ token ผ่าน helper เดียว
    const auth = await authenticateFetchRequest(req as any);
    if (!auth.ok) return withCORS(Response.json(auth.body, { status: auth.status }));
    const user = auth.user!;
    // 

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