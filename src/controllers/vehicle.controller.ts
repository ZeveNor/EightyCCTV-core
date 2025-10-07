import {
  getAllVehicles,

  getVehiclesbyPlate,
  getVehiclesbyPlateCloset,
  addVehicle,
  updateVehicles,
  removeVehicles,
  unremoveVehicles,
  getVehiclesByUserId,
  addMyVehicleById
} from "../services/vehicle.service";
import { withCORS } from "../utils/cors";
import { authenticateFetchRequest } from "../utils/jwt";

export async function handleVehicleRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const auth = await authenticateFetchRequest(req as any);
  if (!auth.ok) return withCORS(Response.json(auth.body, { status: auth.status }));
  const user = auth.user!;


  if (url.pathname === "/api/vehicle/all" && req.method === "GET") {
    try {
      // if (user.role !== "admin" || user.role !== "staff") {
      //   return withCORS(Response.json({ result: "Forbidden" }, { status: 403 }));
      // }
      const result = await getAllVehicles();
      return withCORS(Response.json(result.result, { status: result.status }));
    } catch (err) {
      return withCORS(Response.json({ result: "Invalid token" }, { status: 401 }));
    }
  }



  if (url.pathname === "/api/vehicle/byPlate" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json({ result: "Keywords required (plate)" }, { status: 400 }));
    }

    const result = await getVehiclesbyPlateCloset(body.plate);
    return withCORS(Response.json({ result }, { status: result.status }));
  }

  if (url.pathname === "/api/vehicle/add" && req.method === "POST") {
    const body = await req.json();

    if (!body.userId || !body.plate || !body.province || !body.brand || !body.model || !body.color) {
      return withCORS(
        Response.json({ result: "Missing required fields" }, { status: 400 })
      );
    }

    const result = await addVehicle({
      userId: body.userId,
      plate: body.plate,
      province: body.province,
      brand: body.brand,
      model: body.model,
      color: body.color,
    });

    return withCORS(Response.json(result, { status: result.status }));
  }


  if (url.pathname === "/api/vehicle/addPlate" && req.method === "POST") {

    // if (user.role !== "admin"  || user.role !== "staff") {
    //   return withCORS(Response.json({ result: "Forbidden" }, { status: 403 }));
    // }
    const body = await req.json();
    if (!body.user_id || !body.plate || !body.brand || !body.model || !body.color) {
      return withCORS(Response.json({ result: "Keywords required (user_id, plate, brand, model, color)" }, { status: 400 }));
    }

    const vehicle = {
      userId: body.user_id,
      plate: body.plate,
      brand: body.brand,
      model: body.model,
      color: body.color,
      province: body.province,
    };

    const exist = await getVehiclesbyPlate(vehicle.plate);
    if (exist && exist.result.result.length > 0) {
      return withCORS(Response.json({ result: "This plate already exists" }, { status: 400 }));
    }

    const result = await addVehicle(vehicle);
    return withCORS(Response.json({ result }, { status: result.status }));
  }

  if (url.pathname === "/api/vehicle/addMy" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate || !body.brand || !body.model || !body.color) {
      return withCORS(Response.json({ result: "Keywords required (plate, brand, model, color)" }, { status: 400 }));
    }

    const vehicle = {
      userId: body.user_id,
      plate: body.plate,
      brand: body.brand,
      model: body.model,
      color: body.color,
      province: body.province,
    };
    const exist = await getVehiclesbyPlate(vehicle.plate);
    if (exist && exist.result.result.length > 0) {
      return withCORS(Response.json({ result: "This plate already exists" }, { status: 400 }));
    }
    const result = await addMyVehicleById(user.id, vehicle);
    return withCORS(Response.json(result, { status: result.status }));
  }

  if (url.pathname === "/api/vehicle/updatePlate" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate || !body.new_plate || !body.brand || !body.model || !body.color) {
      return withCORS(Response.json({ result: "Keywords required (plate, new_plate, brand, model, color)" }, { status: 400 }));
    }

    const vehicle = {
      plate: body.plate,
      newPlate: body.new_plate,
      brand: body.brand,
      model: body.model,
      color: body.color,
      province: body.province,
    };

    const result = await updateVehicles(vehicle);
    return withCORS(Response.json({ result }, { status: result.status }));
  }

  if (url.pathname === "/api/vehicle/removePlate" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json(
        { result: "Keywords required (plate)" },
        { status: 400 }
      ));
    }

    const result = await removeVehicles({ plate: body.plate });
    return withCORS(Response.json({ result }, { status: result.status }));
  }


  if (url.pathname === "/api/vehicle/unremovePlate" && req.method === "POST") {
    const body = await req.json();
    if (!body.plate) {
      return withCORS(Response.json({ result: "Keywords required (plate)" }, { status: 400 }));
    }

    const vehicle = {
      plate: body.plate
    };

    const result = await unremoveVehicles(vehicle);
    return withCORS(Response.json({ result }, { status: result.status }));
  }

  if (url.pathname === "/api/vehicle/my" && req.method === "GET") {
    try {
      const result = await getVehiclesByUserId(user.id);

      return withCORS(Response.json(result.result, { status: result.status }));
    } catch (err) {
      return withCORS(Response.json({ result: "Invalid token" }, { status: 401 }));
    }
  }
  return new Response("Not found", { status: 404 });
}