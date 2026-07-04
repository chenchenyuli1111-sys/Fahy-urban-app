import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { Clock, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchLeaderboard } from "@/lib/firestoreService";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [{ title: "Leaderboard" }],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { k } = useLang();
  const [lastUpdated, setLastUpdated] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"points" | "level">("points");
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await fetchLeaderboard(user?.uid, sortBy);
      setTopUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(
        "Failed to fetch neighborhood standings. Please check your network connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();

    const now = new Date();
    const minutes = now.getMinutes();
    setLastUpdated(`${minutes} minutes ago`);
  }, [user, sortBy]);

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => router.history.back()}
            className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex bg-forest/5 p-1 rounded-full">
            <button
              onClick={() => setSortBy("points")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${sortBy === "points" ? "bg-white text-forest shadow-sm" : "text-forest/50"}`}
            >
              Points
            </button>
            <button
              onClick={() => setSortBy("level")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${sortBy === "level" ? "bg-white text-forest shadow-sm" : "text-forest/50"}`}
            >
              Level
            </button>
          </div>
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("leaderboard.title")}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-forest/60 mt-2 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {k("leaderboard.desc")} ({lastUpdated})
          </span>
        </div>
      </header>

      <section className="px-5 mt-4 space-y-3 pb-8">
        {error ? (
          <div className="bg-peach/10 border border-peach/30 rounded-3xl p-6 text-center max-w-sm mx-auto">
            <p className="text-xs text-forest/80 mb-4 font-semibold leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchLeaderboardData}
              className="bg-forest text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-forest/90 active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-3xl border border-black/5 bg-forest/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest/10" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-forest/10 rounded-md w-24" />
                    <div className="h-3 bg-forest/5 rounded-md w-12" />
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <div className="h-4 bg-forest/10 rounded-md w-12 ml-auto" />
                  <div className="h-3 bg-forest/5 rounded-md w-8 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          topUsers.map((u) => (
            <div
              key={u.rank}
              className={`flex items-center justify-between p-4 rounded-3xl border shadow-xs transition-colors ${
                u.isMe
                  ? "bg-fahy-yellow/20 border-fahy-yellow/50"
                  : "bg-white border-black/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${
                    u.rank === 1
                      ? "bg-fahy-yellow text-forest"
                      : u.rank === 2
                        ? "bg-slate-200 text-slate-700"
                        : u.rank === 3
                          ? "bg-peach text-forest"
                          : "bg-forest/5 text-forest/50"
                  }`}
                >
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    u.rank
                  )}
                </div>
                <div className="flex flex-col">
                  <p
                    className={`font-bold text-sm leading-tight ${u.isMe ? "text-forest" : "text-forest/80"}`}
                  >
                    {u.name} {u.isMe && "(You)"}
                  </p>
                  <p className="text-[10px] font-bold text-fahy-yellow">
                    Lv. {u.level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg text-forest">
                  {u.score}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-forest/40 font-semibold">
                  {k("leaderboard.score")}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
