import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import path from "path";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// สร้างชื่อไฟล์แบบไม่ซ้ำกัน
const giveCurrentDateTime = () => {
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    today.getFullYear().toString() +
    pad(today.getMonth() + 1) +
    pad(today.getDate()) +
    "_" +
    pad(today.getHours()) +
    pad(today.getMinutes()) +
    pad(today.getSeconds())
  );
};

export async function uploadToFirebase(file: any): Promise<string> {
  try {
    const dateTime = giveCurrentDateTime();
    const extension = file.name.split(".").pop();
    const filename = `${dateTime}.${extension}`;

    const storageRef = ref(storage, `Eighty_CCTV/${filename}`);

    const metadata = {
      contentType: file.type,
    };

    const snapshot = await uploadBytesResumable(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error: any) {
    throw new Error("Upload to Firebase failed");
  }
}