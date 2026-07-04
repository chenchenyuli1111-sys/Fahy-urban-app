const fs = require("fs");
let code = fs.readFileSync("src/lib/AppState.tsx", "utf8");
code = code.replace(
  `import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";`,
  `import { doc, getDoc, updateDoc, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";`,
);
code = code.replace(
  `const addCoins = async (amount: number) => {`,
  `const addCoins = async (amount: number, reason?: string) => {`,
);
code = code.replace(
  `await updateDoc(userRef, { coins: coins + amount });\n  };`,
  `await updateDoc(userRef, { coins: coins + amount });\n    await addDoc(collection(db, "users", user.uid, "transactions"), {\n      amount,\n      type: "earn",\n      reason: reason || "Earned",\n      timestamp: serverTimestamp()\n    });\n  };`,
);
code = code.replace(
  `const deductCoins = async (amount: number) => {`,
  `const deductCoins = async (amount: number, reason?: string) => {`,
);
code = code.replace(
  `await updateDoc(userRef, { coins: coins - amount });\n      return true;\n    }`,
  `await updateDoc(userRef, { coins: coins - amount });\n      await addDoc(collection(db, "users", user.uid, "transactions"), {\n        amount: -amount,\n        type: "spend",\n        reason: reason || "Spent",\n        timestamp: serverTimestamp()\n      });\n      return true;\n    }`,
);
code = code.replace(
  `addCoins: (amount: number) => void;\n  deductCoins: (amount: number) => Promise<boolean>;`,
  `addCoins: (amount: number, reason?: string) => void;\n  deductCoins: (amount: number, reason?: string) => Promise<boolean>;`,
);
fs.writeFileSync("src/lib/AppState.tsx", code);
