import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useAppState } from "./AppState";
import { gameSounds } from "./sounds";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export interface QuestDef {
  id: string;
  category: "exploration" | "fahy_3d" | "community";
  title: string;
  zhTitle: string;
  desc: string;
  zhDesc: string;
  iconName:
    | "Compass"
    | "Sparkles"
    | "Shirt"
    | "Camera"
    | "Heart"
    | "MessageSquare"
    | "AlertTriangle";
  rewardCoins: number;
  rewardXp: number;
  targetCount: number;
  actionRoute: string;
  actionText: string;
}

export const DAILY_QUEST_DEFINITIONS: QuestDef[] = [
  {
    id: "quest_orbit_3d",
    category: "fahy_3d",
    title: "3D Form Inspection",
    zhTitle: "3D 姿態巡檢",
    desc: "Orbit and inspect your 3D Fahy mascot in 360° to observe its current growth form.",
    zhDesc: "在 3D 舞台上 360° 旋轉觀察你的 Fahy 精靈形態。",
    iconName: "Sparkles",
    rewardCoins: 60,
    rewardXp: 50,
    targetCount: 1,
    actionRoute: "/evolution",
    actionText: "Inspect 3D Fahy",
  },
  {
    id: "quest_dressup_3d",
    category: "fahy_3d",
    title: "Tailor-Made Stylist",
    zhTitle: "專屬造型師",
    desc: "Equip any tailor-made 3D accessory (hat, sunglasses, scarf, or companion) on Fahy.",
    zhDesc: "為 Fahy 裝備任意一件合身的 3D 服飾或隨身配件。",
    iconName: "Shirt",
    rewardCoins: 80,
    rewardXp: 70,
    targetCount: 1,
    actionRoute: "/evolution",
    actionText: "Style Fahy",
  },
  {
    id: "quest_feed_fahy",
    category: "fahy_3d",
    title: "Nurture Spirit",
    zhTitle: "培育靈氣",
    desc: "Train or feed Fahy in the Evolution Deck or Sanctuary to boost its growth XP.",
    zhDesc: "在進化台或聖域訓練/餵養 Fahy，提升成長經驗。",
    iconName: "Heart",
    rewardCoins: 50,
    rewardXp: 100,
    targetCount: 1,
    actionRoute: "/evolution",
    actionText: "Train Fahy",
  },
  {
    id: "quest_scan_ecospot",
    category: "exploration",
    title: "Urban Eco-Explorer",
    zhTitle: "城市生態探索家",
    desc: "Scan or inspect a local biodiversity spot in Fa Hui Park or Mong Kok with Eco Radar.",
    zhDesc: "使用生態雷達掃描並探索花墟公園或旺角生態點。",
    iconName: "Camera",
    rewardCoins: 120,
    rewardXp: 100,
    targetCount: 1,
    actionRoute: "/eco-radar",
    actionText: "Launch Eco Radar",
  },
  {
    id: "quest_artisan_discover",
    category: "exploration",
    title: "Cultural Artisan Discovery",
    zhTitle: "傳統工藝巡禮",
    desc: "Scan a Mong Kok traditional storefront or complete a heritage artisan minigame.",
    zhDesc: "探訪旺角傳統老字號，或完成一次文化工藝小遊戲。",
    iconName: "Compass",
    rewardCoins: 100,
    rewardXp: 80,
    targetCount: 1,
    actionRoute: "/culture",
    actionText: "Explore Culture",
  },
  {
    id: "quest_report_issue",
    category: "exploration",
    title: "Eco-Debt Guardian",
    zhTitle: "綠洲守護者",
    desc: "File or review an environmental issue report to help protect community green spaces.",
    zhDesc: "提交或查看一則社區環境回報，維護社區綠化環境。",
    iconName: "AlertTriangle",
    rewardCoins: 150,
    rewardXp: 120,
    targetCount: 1,
    actionRoute: "/report",
    actionText: "Report Issue",
  },
  {
    id: "quest_sanctuary_chat",
    category: "community",
    title: "Eco AI Companion Chat",
    zhTitle: "精靈語錄交流",
    desc: "Send an eco or urban botanical query to Fahy in the AI Sanctuary.",
    zhDesc: "在精靈聖域與 Fahy 進行一次園藝或都市生態對話。",
    iconName: "MessageSquare",
    rewardCoins: 50,
    rewardXp: 50,
    targetCount: 1,
    actionRoute: "/chat",
    actionText: "Chat with Fahy",
  },
];

export interface QuestProgress {
  current: number;
  claimed: boolean;
}

interface DailyQuestContextType {
  quests: (QuestDef & QuestProgress)[];
  updateQuestProgress: (questId: string, count?: number) => void;
  claimQuestReward: (questId: string) => Promise<void>;
  dailyStreak: number;
  streakClaimedToday: boolean;
  claimStreakReward: () => Promise<void>;
  toastMessage: string | null;
  dismissToast: () => void;
  completedCount: number;
  totalQuests: number;
  todaysDateStr: string;
}

const DailyQuestContext = createContext<DailyQuestContextType | undefined>(
  undefined,
);

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function DailyQuestProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addCoins, addXp, addPoints } = useAppState();

  const [questState, setQuestState] = useState<Record<string, QuestProgress>>(
    {},
  );
  const [dailyStreak, setDailyStreak] = useState(1);
  const [streakClaimedToday, setStreakClaimedToday] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todaysDateStr = getTodayString();

  // Load daily quests state
  useEffect(() => {
    if (!user) return;

    const storageKey = `fahy_quests_${user.uid}_${todaysDateStr}`;
    const streakKey = `fahy_streak_${user.uid}`;

    // Load streak info
    const savedStreak = localStorage.getItem(streakKey);
    if (savedStreak) {
      try {
        const parsed = JSON.parse(savedStreak);
        if (parsed.lastDate === todaysDateStr) {
          setDailyStreak(parsed.streak || 1);
          setStreakClaimedToday(parsed.claimedToday || false);
        } else {
          // Check if yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(
            yesterday.getMonth() + 1,
          ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

          if (parsed.lastDate === yStr) {
            setDailyStreak(parsed.streak || 1);
          } else {
            setDailyStreak(1); // Reset streak
          }
          setStreakClaimedToday(false);
        }
      } catch (e) {
        setDailyStreak(1);
      }
    }

    // Load quest progress
    const savedQuests = localStorage.getItem(storageKey);
    if (savedQuests) {
      try {
        setQuestState(JSON.parse(savedQuests));
      } catch (e) {
        initDefaultQuests();
      }
    } else {
      initDefaultQuests();
    }

    // Sync with Firestore if logged in
    if (auth.currentUser && !user.uid.startsWith("guest_")) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef)
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.dailyQuestsDate === todaysDateStr && data.dailyQuests) {
              setQuestState(data.dailyQuests);
            }
            if (data.dailyStreak) {
              setDailyStreak(data.dailyStreak);
              setStreakClaimedToday(data.streakClaimedDate === todaysDateStr);
            }
          }
        })
        .catch((err) => console.warn("Daily quest cloud sync failed:", err));
    }
  }, [user, todaysDateStr]);

  const initDefaultQuests = () => {
    const initial: Record<string, QuestProgress> = {};
    DAILY_QUEST_DEFINITIONS.forEach((q) => {
      initial[q.id] = { current: 0, claimed: false };
    });
    setQuestState(initial);
  };

  const saveState = (newState: Record<string, QuestProgress>) => {
    setQuestState(newState);
    if (!user) return;
    const storageKey = `fahy_quests_${user.uid}_${todaysDateStr}`;
    localStorage.setItem(storageKey, JSON.stringify(newState));

    if (auth.currentUser && !user.uid.startsWith("guest_")) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        dailyQuestsDate: todaysDateStr,
        dailyQuests: newState,
      }).catch((err) =>
        console.warn("Failed saving daily quests to Firestore:", err),
      );
    }
  };

  const updateQuestProgress = (questId: string, count = 1) => {
    const def = DAILY_QUEST_DEFINITIONS.find((q) => q.id === questId);
    if (!def) return;

    const currentProg = questState[questId] || { current: 0, claimed: false };
    if (currentProg.current >= def.targetCount) return; // Already maxed out

    const newCurrent = Math.min(def.targetCount, currentProg.current + count);
    const updated = {
      ...questState,
      [questId]: {
        ...currentProg,
        current: newCurrent,
      },
    };

    saveState(updated);

    if (newCurrent >= def.targetCount) {
      gameSounds.play("sparkle");
      setToastMessage(
        `🎯 Daily Quest Completed: ${def.title}! Claim your reward.`,
      );
    } else {
      gameSounds.play("click");
      setToastMessage(
        `⚡ Progress: ${def.title} (${newCurrent}/${def.targetCount})`,
      );
    }
  };

  const claimQuestReward = async (questId: string) => {
    const def = DAILY_QUEST_DEFINITIONS.find((q) => q.id === questId);
    const currentProg = questState[questId];
    if (
      !def ||
      !currentProg ||
      currentProg.claimed ||
      currentProg.current < def.targetCount
    ) {
      return;
    }

    const updated = {
      ...questState,
      [questId]: {
        ...currentProg,
        claimed: true,
      },
    };

    saveState(updated);

    gameSounds.play("coin");
    addCoins(def.rewardCoins, `Daily Quest: ${def.title}`);
    addXp(def.rewardXp);
    addPoints(def.rewardCoins * 5);

    setToastMessage(
      `🎉 Claimed +${def.rewardCoins} Coins & +${def.rewardXp} XP!`,
    );
  };

  const claimStreakReward = async () => {
    if (streakClaimedToday) return;

    const bonusCoins = 100 * dailyStreak;
    const bonusXp = 80 * dailyStreak;

    setStreakClaimedToday(true);
    const newStreak = Math.min(7, dailyStreak + 1);
    setDailyStreak(newStreak);

    if (user) {
      const streakKey = `fahy_streak_${user.uid}`;
      localStorage.setItem(
        streakKey,
        JSON.stringify({
          streak: newStreak,
          lastDate: todaysDateStr,
          claimedToday: true,
        }),
      );

      if (auth.currentUser && !user.uid.startsWith("guest_")) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
          dailyStreak: newStreak,
          streakClaimedDate: todaysDateStr,
        }).catch((err) =>
          console.warn("Failed saving streak to Firestore:", err),
        );
      }
    }

    gameSounds.play("fanfare");
    addCoins(bonusCoins, `Daily Streak Day ${dailyStreak}`);
    addXp(bonusXp);

    setToastMessage(
      `🔥 Day ${dailyStreak} Streak Bonus Claimed! +${bonusCoins} Coins & +${bonusXp} XP!`,
    );
  };

  const dismissToast = () => setToastMessage(null);

  const questsWithProgress = DAILY_QUEST_DEFINITIONS.map((def) => ({
    ...def,
    current: questState[def.id]?.current || 0,
    claimed: questState[def.id]?.claimed || false,
  }));

  const completedCount = questsWithProgress.filter(
    (q) => q.current >= q.targetCount,
  ).length;
  const totalQuests = DAILY_QUEST_DEFINITIONS.length;

  return (
    <DailyQuestContext.Provider
      value={{
        quests: questsWithProgress,
        updateQuestProgress,
        claimQuestReward,
        dailyStreak,
        streakClaimedToday,
        claimStreakReward,
        toastMessage,
        dismissToast,
        completedCount,
        totalQuests,
        todaysDateStr,
      }}
    >
      {children}
    </DailyQuestContext.Provider>
  );
}

export function useDailyQuests() {
  const ctx = useContext(DailyQuestContext);
  if (!ctx) {
    throw new Error("useDailyQuests must be used within a DailyQuestProvider");
  }
  return ctx;
}
