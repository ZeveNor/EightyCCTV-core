import { extname, join } from "path";
import db from "../models/db";
import { writeFile, readdir, rm } from "fs/promises";
import { mkdir } from "fs/promises";
import axios from "axios";

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

export const provinceMaps: Record<string, string> = {
  BKK: "กรุงเทพมหานคร",
  AYT: "พระนครศรีอยุธยา",
  AYT2: "อยุธยา", // alternative
  ACO: "อ่างทอง",
  AKN: "อำนาจเจริญ",
  BKN: "บึงกาฬ",
  BRI: "บุรีรัมย์",
  CBI: "ชลบุรี",
  CBR: "ชัยภูมิ",
  CCO: "ฉะเชิงเทรา",
  CNX: "เชียงใหม่",
  CRI: "เชียงราย",
  KBI: "กระบี่",
  KAN: "กาญจนบุรี",
  KKN: "ขอนแก่น",
  KPT: "กำแพงเพชร",
  KRI: "กาฬสินธุ์",
  LMP: "ลำพูน",
  LPN: "ลำปาง",
  LKS: "เลย",
  MHS: "แม่ฮ่องสอน",
  MUK: "มุกดาหาร",
  MDS: "มหาสารคาม",
  NAK: "นครนายก",
  NMA: "นครราชสีมา",
  NPT: "นครปฐม",
  NPM: "นครพนม",
  NBT: "นนทบุรี",
  NWT: "นราธิวาส",
  NBI: "น่าน",
  PBI: "ประจวบคีรีขันธ์",
  PNI: "พังงา",
  PBR: "เพชรบูรณ์",
  PCH: "เพชรบุรี",
  PLG: "พะเยา",
  PKN: "แพร่",
  PNO: "พัทลุง",
  PRI: "พิษณุโลก",
  PSS: "พิษณุโลก (สำรอง)",
  PSL: "ปัตตานี",
  PTT: "ปราจีนบุรี",
  PTN: "พิจิตร",
  RBR: "ราชบุรี",
  RYG: "ระยอง",
  RBN: "ระนอง",
  RBRI: "ร้อยเอ็ด",
  SKN: "สกลนคร",
  SNI: "สมุทรสงคราม",
  SPM: "สมุทรปราการ",
  SSK: "สมุทรสาคร",
  SRI: "สระบุรี",
  SRB: "สระแก้ว",
  STN: "สตูล",
  SPB: "สุพรรณบุรี",
  SRI2: "สุราษฎร์ธานี",
  SRN: "สุรินทร์",
  TKI: "ตาก",
  TRG: "ตรัง",
  TRB: "ตราด",
  UBN: "อุบลราชธานี",
  UBR: "อุดรธานี",
  UTR: "อุตรดิตถ์",
  UDN: "อุทัยธานี",
  YAS: "ยโสธร",
  YLA: "ยะลา",
  LOP: "ลพบุรี",
  PTH: "ปทุมธานี",
  NRI: "นครศรีธรรมราช",
  SNI2: "สงขลา",
  STG: "สิงห์บุรี",
  SRI3: "สุโขทัย",
  PHE: "ภูเก็ต",
  KAL: "ชัยนาท",
  KPP: "ชุมพร",
  CPN: "จันทบุรี",
  NMG: "หนองบัวลำภู",
  NCM: "หนองคาย"
};

// Thai characters mapping
const characterThais: Record<string, string> = {
  A01: "ก", A02: "ข", A03: "ฃ", A04: "ค", A05: "ฅ", A06: "ฆ",
  A07: "ง", A08: "จ", A09: "ฉ", A10: "ช", A11: "ซ", A12: "ฌ",
  A13: "ญ", A14: "ฎ", A15: "ฏ", A16: "ฐ", A17: "ฑ", A18: "ฒ",
  A19: "ณ", A20: "ด", A21: "ต", A22: "ถ", A23: "ท", A24: "ธ",
  A25: "น", A26: "บ", A27: "ป", A28: "ผ", A29: "ฝ", A30: "พ",
  A31: "ฟ", A32: "ภ", A33: "ม", A34: "ย", A35: "ร", A36: "ล",
  A37: "ว", A38: "ศ", A39: "ษ", A40: "ส", A41: "ห", A42: "ฬ",
  A43: "อ", A44: "ฮ",
};

function mapClassToChar(code: string): string {
  if (provinceMaps[code]) return provinceMaps[code];       // จังหวัด
  if (characterThais[code]) return characterThais[code];     // อักษร
  if (/^\d+$/.test(code)) return code;                     // ตัวเลข
  return code;                                             // fallback
}

function parsePlate(predictions: any[]): string {
  const provincePreds = predictions.filter((p) => provinceMaps[p.class]);
  const charPreds = predictions.filter((p) => !provinceMaps[p.class]);

  let province: string | undefined;
  if (provincePreds.length > 0) {
    const bestProvince = provincePreds.sort((a, b) => b.confidence - a.confidence)[0];
    province = provinceMaps[bestProvince.class];
  }

  const sortedChars = charPreds.sort((a, b) => a.x - b.x);
  const chars: string[] = sortedChars.map((p) => mapClassToChar(p.class));

  return province ? `${chars.join("")} ${province}` : chars.join("");
}

export async function UploadImage(file: Blob, filename?: string) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    let originalName = (file as any).name || "upload.jpg";
    const ext = extname(filename || originalName) || ".jpg";
    const baseName = filename
      ? filename.replace(extname(filename), "")
      : `upload_${Date.now()}`;

    const saveFileName = `${baseName}${ext}`;
    const uploadsDir = join(process.cwd(), "uploads");
    const savePath = join(uploadsDir, saveFileName);

    await mkdir(uploadsDir, { recursive: true });

    const files = await readdir(uploadsDir);
    for (const f of files) {
      await rm(join(uploadsDir, f));
    }

    await writeFile(savePath, buffer);

    const base64Image = buffer.toString("base64");

    const response = await axios({
      method: "POST",
      url: "https://serverless.roboflow.com/new-o9hkx-8rhlc/1",
      params: {
        api_key: "tSBimdbX6MHzfAbfx6zW",
      },
      data: base64Image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const plate = parsePlate(response.data.predictions ?? []);

    return {
      status: 200,
      file: saveFileName,
      plate,
    };
  } catch (err) {
    console.error("UploadImage error:", err);
    throw err;
  }
}


export default {
  getAllEntry,
  getEntryByPlate,
  startEntry,
  endEntry,
  postData,
  getLastestEntry,
  UploadImage
}
