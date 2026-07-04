import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import { CheckCircle2, CircleDashed, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [{ title: "Eco & Culture Tasks — The Fahy Hub" }],
  }),
  component: Tasks,
});

function Tasks() {
  const { k, formatCoins } = useLang();
  const { addCoins, addPoints, addXp } = useAppState();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgesCount, setBadgesCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [hasEquipped, setHasEquipped] = useState(false);
  const [collectedTasks, setCollectedTasks] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Listen to user profile for badges, equipped badge, and collected tasks
    const userUnsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBadgesCount((data.badges || []).length);
          setHasEquipped(Boolean(data.equippedBadge));
          setCollectedTasks(data.collectedTasks || []);
        }
      },
      (err) => {
        console.error("Error listening to user in tasks:", err);
        setError("Unable to sync quest progress from server.");
        setLoading(false);
      },
    );

    // 2. Fetch user's reports count from Firestore
    const reportsQuery = query(
      collection(db, "reports"),
      where("userId", "==", user.uid),
    );
    const reportsUnsub = onSnapshot(
      reportsQuery,
      (snap) => {
        setReportsCount(snap.size);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to reports in tasks:", err);
        setError("Unable to sync report progress from server.");
        setLoading(false);
      },
    );

    return () => {
      userUnsub();
      reportsUnsub();
    };
  }, [user]);

  const taskDefinitions = [
    {
      id: "task_artisan",
      title: "Discover Local Culture",
      desc: "Collect your first traditional artisan badge by scanning a storefront or craft item in Mong Kok.",
      reward: 50,
      done: badgesCount > 0,
    },
    {
      id: "task_report",
      title: "Eco-Debt Guardian",
      desc: "Report at least one environmental or public facility issue in Fa Hui Park to help restoretion efforts.",
      reward: 100,
      done: reportsCount > 0,
    },
    {
      id: "task_equip",
      title: "Proud Representation",
      desc: "Equip any unlocked artisan badge or title to showcase your cultural identity in your profile.",
      reward: 30,
      done: hasEquipped,
    },
  ];

  const handleCollect = async (taskId: string, reward: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedCollected = [...collectedTasks, taskId];

      await updateDoc(userRef, {
        collectedTasks: updatedCollected,
      });

      addCoins(reward, `Completed Daily Challenge: ${taskId}`);
      addPoints(reward * 10);
      addXp(reward * 5);
    } catch (err) {
      console.error("Failed to collect task reward:", err);
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <button
          onClick={() => router.history.back()}
          className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest mb-4 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("tasks.title")}
        </h1>
        <p className="text-xs text-forest/60 mt-2 font-medium">
          {k("tasks.desc")}
        </p>
      </header>

      {error ? (
        <div className="bg-peach/10 border border-peach/30 rounded-3xl p-6 text-center max-w-sm mx-auto my-8">
          <p className="text-xs text-forest/80 mb-4 font-semibold leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="bg-forest text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-forest/90 active:scale-95 transition-transform"
          >
            Retry Sync
          </button>
        </div>
      ) : loading ? (
        <section className="px-5 mt-4 space-y-4 pb-8 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl border border-black/5 shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 w-full">
                  <div className="w-5 h-5 bg-forest/10 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-forest/10 rounded-md w-1/2" />
                    <div className="h-3 bg-forest/5 rounded-md w-4/5" />
                    <div className="h-3 bg-forest/5 rounded-md w-2/3" />
                  </div>
                </div>
                <div className="h-4 bg-peach/20 rounded-md w-10 shrink-0 ml-2" />
              </div>
              <div className="h-11 bg-forest/10 rounded-2xl w-full" />
            </div>
          ))}
        </section>
      ) : (
        <section className="px-5 mt-4 space-y-4 pb-8">
          {taskDefinitions.map((task) => {
            const isCollected = collectedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className="bg-white p-5 rounded-3xl border border-black/5 shadow-xs flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-sage-deep" />
                      ) : (
                        <CircleDashed className="w-5 h-5 text-forest/20" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${task.done ? "text-forest" : "text-forest/70"}`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-xs text-forest/50 mt-1 leading-relaxed">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                  <p className="font-display font-bold text-peach text-sm whitespace-nowrap ml-2">
                    +{formatCoins(task.reward)}
                  </p>
                </div>

                <button
                  disabled={!task.done || isCollected}
                  onClick={() => handleCollect(task.id, task.reward)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-colors active:scale-[0.98] ${
                    isCollected
                      ? "bg-forest/5 text-forest/40 cursor-not-allowed"
                      : task.done
                        ? "bg-forest text-white shadow-sm hover:bg-forest/90"
                        : "bg-forest/5 text-forest/40 cursor-not-allowed"
                  }`}
                >
                  {isCollected
                    ? k("tasks.collected")
                    : task.done
                      ? k("tasks.collect")
                      : "Not Completed Yet"}
                </button>
              </div>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}
