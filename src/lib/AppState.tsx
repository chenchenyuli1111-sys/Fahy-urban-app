import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

interface AppState {
  coins: number;
  xp: number;
  level: number;
  points: number;
  unlockedBadges: string[];
  equippedBadge: string | null;
  addCoins: (amount: number, reason?: string) => void;
  deductCoins: (amount: number, reason?: string) => Promise<boolean>;
  addXp: (amount: number) => void;
  addPoints: (amount: number) => void;
  setEquippedBadge: (badgeKey: string | null) => Promise<void>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [equippedBadge, setEquippedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCoins(0);
      setXp(0);
      setLevel(1);
      setPoints(0);
      setUnlockedBadges([]);
      setEquippedBadge(null);
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCoins(data.coins || 0);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setPoints(data.points || 0);
        setUnlockedBadges(data.badges || []);
        setEquippedBadge(data.equippedBadge || null);
      }
    });

    return () => unsub();
  }, [user]);

  const addCoins = async (amount: number, reason?: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { coins: coins + amount });
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      amount,
      type: "earn",
      reason: reason || "Earned",
      timestamp: serverTimestamp(),
    });
  };

  const deductCoins = async (amount: number, reason?: string) => {
    if (!user) return false;
    if (coins >= amount) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { coins: coins - amount });
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        amount: -amount,
        type: "spend",
        reason: reason || "Spent",
        timestamp: serverTimestamp(),
      });
      return true;
    }
    return false;
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    const newXp = xp + amount;
    // Calculate new level (every 100 XP = 1 level, starting at level 1)
    const newLevel = Math.floor(newXp / 100) + 1;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { xp: newXp, level: newLevel });
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { points: points + amount });
  };

  const updateEquippedBadge = async (badgeKey: string | null) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { equippedBadge: badgeKey });
  };

  return (
    <AppStateContext.Provider
      value={{
        coins,
        xp,
        level,
        points,
        unlockedBadges,
        equippedBadge,
        addCoins,
        deductCoins,
        addXp,
        addPoints,
        setEquippedBadge: updateEquippedBadge,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
