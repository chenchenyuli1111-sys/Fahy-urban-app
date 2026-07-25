import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { useAuth } from "./AuthContext";
import { handleFirestoreError, OperationType } from "./firestoreError";

interface AppState {
  coins: number;
  xp: number;
  level: number;
  points: number;
  unlockedBadges: string[];
  equippedBadge: string | null;
  equippedFahy: string | null;
  addCoins: (amount: number, reason?: string) => void;
  deductCoins: (amount: number, reason?: string) => Promise<boolean>;
  addXp: (amount: number) => void;
  addPoints: (amount: number) => void;
  setEquippedBadge: (badgeKey: string | null) => Promise<void>;
  setEquippedFahy: (fahyId: string | null) => Promise<void>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [coins, setCoins] = useState(850);
  const [xp, setXp] = useState(140);
  const [level, setLevel] = useState(2);
  const [points, setPoints] = useState(1500);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([
    "culture.badge.gen_0",
  ]);
  const [equippedBadge, setEquippedBadge] = useState<string | null>(null);
  const [equippedFahy, setEquippedFahy] = useState<string | null>(null);

  const saveLocalGuestState = (updated: Record<string, any>) => {
    if (!user) return;
    const currentKey = `fahy_guest_state_${user.uid}`;
    const existing = localStorage.getItem(currentKey);
    let currentData = {};
    if (existing) {
      try {
        currentData = JSON.parse(existing);
      } catch (e) {}
    }
    const merged = { ...currentData, ...updated };
    localStorage.setItem(currentKey, JSON.stringify(merged));
  };

  useEffect(() => {
    if (!user) {
      setCoins(0);
      setXp(0);
      setLevel(1);
      setPoints(0);
      setUnlockedBadges([]);
      setEquippedBadge(null);
      setEquippedFahy(null);
      return;
    }

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      const saved = localStorage.getItem(`fahy_guest_state_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCoins(parsed.coins ?? 850);
          setXp(parsed.xp ?? 140);
          setLevel(parsed.level ?? 2);
          setPoints(parsed.points ?? 1500);
          setUnlockedBadges(parsed.badges ?? ["culture.badge.gen_0"]);
          setEquippedBadge(parsed.equippedBadge ?? null);
          setEquippedFahy(parsed.equippedFahy ?? null);
        } catch (e) {
          setCoins(850);
          setXp(140);
          setLevel(2);
          setPoints(1500);
          setUnlockedBadges(["culture.badge.gen_0"]);
        }
      } else {
        setCoins(850);
        setXp(140);
        setLevel(2);
        setPoints(1500);
        setUnlockedBadges(["culture.badge.gen_0"]);
      }
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCoins(data.coins ?? 0);
          setXp(data.xp ?? 0);
          setLevel(data.level ?? 1);
          setPoints(data.points ?? 0);
          setUnlockedBadges(data.badges ?? []);
          setEquippedBadge(data.equippedBadge ?? null);
          setEquippedFahy(data.equippedFahy ?? null);
        }
      },
      (err) => {
        console.warn("AppState snapshot warning:", err);
      },
    );

    return () => unsub();
  }, [user]);

  const addCoins = async (amount: number, reason?: string) => {
    if (!user) return;
    const newCoins = coins + amount;
    setCoins(newCoins);

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      saveLocalGuestState({ coins: newCoins });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { coins: newCoins });
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        amount,
        type: "earn",
        reason: reason || "Earned",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const deductCoins = async (amount: number, reason?: string) => {
    if (!user) return false;
    if (coins >= amount) {
      const newCoins = coins - amount;
      setCoins(newCoins);

      if (!auth.currentUser || user.uid.startsWith("guest_")) {
        saveLocalGuestState({ coins: newCoins });
        return true;
      }

      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, { coins: newCoins });
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: -amount,
          type: "spend",
          reason: reason || "Spent",
          timestamp: serverTimestamp(),
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
    return false;
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    const newXp = xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    setXp(newXp);
    setLevel(newLevel);

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      saveLocalGuestState({ xp: newXp, level: newLevel });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { xp: newXp, level: newLevel });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    const newPoints = points + amount;
    setPoints(newPoints);

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      saveLocalGuestState({ points: newPoints });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { points: newPoints });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const updateEquippedBadge = async (badgeKey: string | null) => {
    if (!user) return;
    setEquippedBadge(badgeKey);

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      saveLocalGuestState({ equippedBadge: badgeKey });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { equippedBadge: badgeKey });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const updateEquippedFahy = async (fahyId: string | null) => {
    if (!user) return;
    setEquippedFahy(fahyId);

    if (!auth.currentUser || user.uid.startsWith("guest_")) {
      saveLocalGuestState({ equippedFahy: fahyId });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, { equippedFahy: fahyId });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
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
        equippedFahy,
        addCoins,
        deductCoins,
        addXp,
        addPoints,
        setEquippedBadge: updateEquippedBadge,
        setEquippedFahy: updateEquippedFahy,
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
