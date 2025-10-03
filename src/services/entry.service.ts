import db from "../models/db";

export async function getAllEntry() {
  try {
    const sql = `SELECT * FROM vehicle_logs;`;
    const res = await db.query(`SELECT * FROM vehicle_logs;`);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}

export async function getEntryByPlate(plate: string) {
  try {
    const sql = `SELECT * from vehicle_logs WHERE license_plate = $1;`;
    const values = [plate];
    const res = await db.query(sql, values);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle by plate failed" };
  }
}

export async function startEntry(plate: string) {
  try {
    const sql = `INSERT INTO vehicle_logs (license_plate, entry_time) VALUES ($1, NOW()) RETURNING *;`;
    const values = [plate];
    const res = await db.query(sql, values);

    return { status: 200, result: { result: res.rows[0] } };
  } catch {
    return { status: 400, result: "Start vehicle entry failed" };
  }
}

export async function endEntry(plate: string) {
  try {
    const sql = `UPDATE vehicle_logs SET exit_time = NOW() WHERE license_plate = $1 AND exit_time IS NULL RETURNING *;`;
    const values = [plate];
    const res = await db.query(sql, values);

    if (res.rowCount === 0) {
      return { status: 404, result: "No active entry found for this plate" };
    }

    return { status: 200, result: { result: res.rows[0] } };
  } catch {
    return { status: 400, result: "End vehicle entry failed" };
  }
}

const provinceMap = {
  SRN: "สุรินทร์",
  BKK: "กรุงเทพมหานคร",
  CNX: "เชียงใหม่",
  KBI: "กระบี่",
  NMA: "นครราชสีมา",
  // ... เพิ่มจังหวัดอื่นๆตามที่ต้องการ
};



const characterThai: Record<string, string> = {
  A01: "ก", A02: "ข", A03: "ฃ", A04: "ค", A05: "ฅ", A06: "ฆ",
  A07: "ง", A08: "จ", A09: "ฉ", A10: "ช", A11: "ซ", A12: "ฌ",
  A13: "ญ", A14: "ฎ", A15: "ฏ", A16: "ฐ", A17: "ฑ", A18: "ฒ",
  A19: "ณ", A20: "ด", A21: "ต", A22: "ถ", A23: "ท", A24: "ธ",
  A25: "น", A26: "บ", A27: "ป", A28: "ผ", A29: "ฝ", A30: "พ",
  A31: "ฟ", A32: "ภ", A33: "ม", A34: "ย", A35: "ร", A36: "ล",
  A37: "ว", A38: "ศ", A39: "ษ", A40: "ส", A41: "ห", A42: "ฬ",
  A43: "อ", A44: "ฮ",
};

function parseLicense(arr: string[]): string {
  const chars = arr.slice(0, 2).map(code => characterThai[code] || code);
  const numbers = arr.slice(2);
  return [...chars, ...numbers].join("");
}

export async function postData(type: string) {
  const url = "http://127.0.0.1:8000/detect-once";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Plate model don't start yet: ${res.status}`);
  }

  const json = await res.json();
  const raw = {
    license_plate: json[0],
    province: json[1]
  };

  raw.province = raw.province.map(
    (code: string) => provinceMap[code?.toUpperCase() as keyof typeof provinceMap] || code
  );

  const licensePlate = parseLicense(raw.license_plate)

  if (!licensePlate) {
    throw new Error("license_plate is required");
  }

  let response;
  if (type === "true") {
    const sql = `INSERT INTO vehicle_logs (license_plate,province, entry_time) VALUES ($1, $2, NOW()) RETURNING *;`;
    const values = [licensePlate, raw.province];
    response = await db.query(sql, values);
  }
  else if (type === "false") {
    const sql = `UPDATE vehicle_logs SET exit_time = NOW() WHERE license_plate = $1 AND exit_time IS NULL RETURNING *;`;
    console.log(licensePlate);
    const values = [licensePlate];
    response = await db.query(sql, values);

    if (response.rowCount === 0) {
      return { status: 404, result: "No active entry found for this plate" };
    }
  }
  return { status: 200, result: "ok" };
}

export async function getLastestEntry() {
  try {
    const sql = `
      SELECT *
      FROM vehicle_logs
      WHERE entry_time >= NOW() - INTERVAL '5 minutes'
      ORDER BY entry_time DESC
      LIMIT 1;
    `;
    const res = await db.query(sql);

    if (res.rows.length === 0) {
      return { status: 400, result: "No Record" };
    }

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "No Record" };
  }
}


export default {
  getAllEntry,
  getEntryByPlate,
  startEntry,
  endEntry,
  postData,
  getLastestEntry
}