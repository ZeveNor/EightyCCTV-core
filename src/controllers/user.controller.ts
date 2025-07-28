import { getUserProfile, updateUserProfile, updateProfileImage } from "../services/user.service";
import { requireAuth } from "../middleware/auth";

export async function handleUserRoutes(req: Request): Promise<Response> {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const url = new URL(req.url);

  // GET /api/user/me
  if (req.method === "GET" && url.pathname === "/api/user/me") {
    const profile = await getUserProfile(Number(user.id));
    if (!profile) return Response.json({ message: "User not found" }, { status: 404 });
    return Response.json(profile);
  }

  // PUT /api/user/me
  if (req.method === "PUT" && url.pathname === "/api/user/me") {
    const body = await req.json();
    await updateUserProfile(Number(user.id), body);
    return Response.json({ message: "Profile updated" });
  }

  if (req.method === "POST" && url.pathname === "/api/user/me/profile-image") {
    // 1. รับ multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ message: "No file uploaded" }, { status: 400 });
    }

    // 2. สร้างชื่อไฟล์ใหม่ ป้องกันชื่อซ้ำ
    const filename = `profile_${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
    const uploadPath = `./uploads/${filename}`;

    // 3. บันทึกไฟล์ลง disk
    await Bun.write(uploadPath, file);

    // 4. อัปเดต path ในฐานข้อมูล
    await updateProfileImage(Number(user.id), filename);

    // 5. ส่ง URL กลับ
    return Response.json({ url: `/uploads/${filename}` });
  }
  return new Response("Not found", { status: 404 });
}