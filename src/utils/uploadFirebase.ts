import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

export async function uploadToFirebase(file: Blob, filename: string): Promise<string> {
  const ext = filename.split(".").pop() || "jpg";
  const storageRef = ref(storage, `Eighty_CCTV/${filename}`);
  const buffer = await file.arrayBuffer();
  await uploadBytes(storageRef, new Uint8Array(buffer));
  return await getDownloadURL(storageRef);
}