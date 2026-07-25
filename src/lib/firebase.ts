import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgyo15EhuQ1KmpaNfPhxFXvt9365CLoDQ",
  authDomain: "urban-planner-494613.firebaseapp.com",
  projectId: "urban-planner-494613",
  storageBucket: "urban-planner-494613.firebasestorage.app",
  messagingSenderId: "825806542142",
  appId: "1:825806542142:web:f0d21bb934850cb2fa486f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(
  app,
  "ai-studio-fahyurbanpulse-cc7f8170-5d4a-41bc-a181-be141cf6351a",
);
export const storage = getStorage(app);

// Test Firestore connection on initial boot as required by rules
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.warn(
        "Firestore test connection warning: Client is offline. Please check network/config.",
      );
    }
  }
}
testConnection();
