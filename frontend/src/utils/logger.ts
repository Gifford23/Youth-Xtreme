// src/utils/logger.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const logActivity = async (action: string, details: string) => {
  try {
    // Check if Firebase is configured
    if (!db) {
      console.warn("Firebase not configured. Activity logging disabled.");
      return;
    }

    await addDoc(collection(db, "activity_logs"), {
      action: action, // e.g., "Created Event"
      details: details, // e.g., "Event: Friday Night Service created"
      timestamp: serverTimestamp(), // Uses server time to be accurate
    });

    console.log(`✅ Activity logged: ${action}`);
  } catch (error) {
    console.error("❌ Error writing activity log:", error);
  }
};
