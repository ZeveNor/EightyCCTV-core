import {
  getAllEntry,
  getEntryByPlate,
  startEntry,
  endEntry,
  getLastestEntry,
  postData,
  UploadImage,
  getEntryByUserId,
} from "../services/entry.service";
import { withCORS } from "../utils/cors";

export async function handleEntryRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/api/entry" && req.method === "GET") {
    const result = await getAllEntry();
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/byPlate" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json({ result: "Plate required" }, { status: 400 }));
    }

    const result = await getEntryByPlate(body.plate);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/vehicle/byUserId" && req.method === "POST") {
    const body = await req.json();
    if (!body.userId) {
      return withCORS(Response.json({ result: "User ID required" }, { status: 400 }));
    }

    const result = await getEntryByUserId(body.userId);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/start" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json({ result: "Plate required" }, { status: 400 }));
    }

    const result = await startEntry(body.plate);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/end" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json({ result: "Plate required" }, { status: 400 }));
    }

    const result = await endEntry(body.plate);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/model/lastest" && req.method === "GET") {
    const result = await getLastestEntry();
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/model/push" && req.method === "POST") {
    const body = await req.json();
    if (!body.type) {
      return withCORS(Response.json({ result: "Plate required" }, { status: 400 }));
    }

    const result = await postData(body.type);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/entry/upload" && req.method === "POST") {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return withCORS(Response.json({ result: "File required" }, { status: 400 }));
    }

    const result = await UploadImage(file);
    return withCORS(Response.json({ result }));
  }


  return new Response("Not found", { status: 404 });
}