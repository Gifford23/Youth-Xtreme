// src/utils/notify.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const sendNotification = async (
  message: string,
  type: "info" | "success" | "warning" | "alert" = "info",
  link?: string
) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "notifications"), {
      message,
      type,
      read: false,
      link,
      created_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
