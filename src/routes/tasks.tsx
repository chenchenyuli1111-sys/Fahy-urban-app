import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import { useDailyQuests, type QuestDef } from "@/lib/DailyQuestContext";
import { Fahy3DMascot } from "@/components/fahy/Fahy3DMascot";
import {
  CheckCircle2,
  CircleDashed,
  ArrowLeft,
  Sparkles,
  Flame,
  Clock,
  Compass,
  Shirt,
  Camera,
  Heart,
  MessageSquare,
  AlertTriangle,
  Gift,
  ChevronRight,
  Trophy,
  Zap,
  RotateCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [{ title: "Daily Quests & Urban Exploration — The Fahy Hub" }],
  }),
  component: Tasks,
});

function QuestIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Shirt":
      return <Shirt className={className} />;
    case "Heart":
      return <Heart className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Compass":
      return <Compass className={className} />;
    case "AlertTriangle":
      return <AlertTriangle className={className} />;
    case "MessageSquare":
      return <MessageSquare className={className} />;
    default:
      return <Compass className={className} />;
  }
}

function Tasks() {
  const { k, formatCoins } = useLang();
  const { coins, xp, level } = useAppState();
  const {
    quests,
    claimQuestReward,
    dailyStreak,
    streakClaimedToday,
    claimStreakReward,
    completedCount,
    totalQuests,
  } = useDailyQuests();

  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "exploration" | "fahy_3d" | "community"
  >("all");
  const [show3DPreview, setShow3DPreview] = useState(false);

  // Daily countdown timer calculation
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeftStr(
        `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredQuests = quests.filter((q) => {
    if (categoryFilter === "all") return true;
    return q.category === categoryFilter;
  });

  const totalEarnableCoins = quests.reduce((acc, q) => acc + q.rewardCoins, 0);
  const totalEarnedCoins = quests
    .filter((q) => q.claimed)
    .reduce((acc, q) => acc + q.rewardCoins, 0);

  return (
    <AppShell>
      {/* Header Bar */}
      <header className="px-5 pt-8 pb-4 bg-gradient-to-b from-forest/10 via-forest/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.history.back()}
            className="w-9 h-9 rounded-2xl bg-white shadow-xs border border-black/5 flex items-center justify-center text-forest active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 text-[11px] font-bold text-forest shadow-2xs">
            <Clock
              className="w-3.5 h-3.5 text-fahy-yellow animate-spin"
              style={{ animationDuration: "8s" }}
            />
            <span>Resets in: {timeLeftStr}</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-forest">
              Daily Quests & Exploration
            </h1>
            <p className="text-xs text-forest/70 mt-1 font-medium">
              Complete daily urban challenges & interact with 3D Fahy to earn
              rewards!
            </p>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-forest/60 mb-0.5">
              <Trophy className="w-3 h-3 text-amber-500" />
              Progress
            </div>
            <p className="font-display font-extrabold text-lg text-forest">
              {completedCount}/{totalQuests}
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-forest/60 mb-0.5">
              <Flame className="w-3 h-3 text-orange-500" />
              Streak
            </div>
            <p className="font-display font-extrabold text-lg text-forest">
              {dailyStreak} <span className="text-xs font-normal">Days</span>
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-forest/60 mb-0.5">
              <Zap className="w-3 h-3 text-fahy-yellow" />
              Earned
            </div>
            <p className="font-display font-extrabold text-lg text-forest">
              +{formatCoins(totalEarnedCoins)}
            </p>
          </div>
        </div>
      </header>

      {/* 7-Day Exploration Streak Banner */}
      <section className="px-5 mt-2">
        <div className="bg-gradient-to-r from-forest via-emerald-900 to-forest text-white rounded-3xl p-5 shadow-lg border border-emerald-500/20 relative overflow-hidden">
          {/* Background ambient glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-fahy-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-fahy-yellow/20 border border-fahy-yellow/40 flex items-center justify-center">
                <Flame className="w-4 h-4 text-fahy-yellow" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm leading-tight text-white">
                  7-Day Exploration Streak
                </h2>
                <p className="text-[11px] text-white/70">
                  Log in & explore daily to unlock the Day 7 Gold Crown 👑
                </p>
              </div>
            </div>

            <button
              disabled={streakClaimedToday}
              onClick={claimStreakReward}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                streakClaimedToday
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-fahy-yellow text-forest shadow-md hover:brightness-110 active:scale-95 animate-bounce"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              {streakClaimedToday ? "Claimed" : "Claim Day Bonus"}
            </button>
          </div>

          {/* 7 Day Nodes Roadmap */}
          <div className="grid grid-cols-7 gap-1.5 mt-4 relative z-10">
            {Array.from({ length: 7 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < dailyStreak;
              const isCurrent = dayNum === dailyStreak;
              const isSpecial = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? "bg-fahy-yellow/20 border-fahy-yellow text-fahy-yellow shadow-sm ring-2 ring-fahy-yellow/40"
                      : isPast
                        ? "bg-white/10 border-white/20 text-white/80"
                        : "bg-black/20 border-white/10 text-white/40"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    D{dayNum}
                  </span>
                  <div className="my-1 text-sm">
                    {isSpecial ? "👑" : isPast ? "✓" : "🎁"}
                  </div>
                  <span className="text-[9px] font-extrabold">
                    +{dayNum * 100}c
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick 3D Fahy Interaction Deck Toggle */}
      <section className="px-5 mt-4">
        <div className="bg-white rounded-3xl p-4 border border-black/5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-forest">
                Quick 3D Fahy Companion Stage
              </h3>
              <p className="text-[11px] text-forest/60">
                Inspect 3D Fahy or style accessories directly from here!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShow3DPreview(!show3DPreview)}
            className="px-3 py-1.5 bg-forest/5 hover:bg-forest/10 text-forest font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {show3DPreview ? "Hide 3D" : "Open 3D"}
          </button>
        </div>

        <AnimatePresence>
          {show3DPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden bg-white/90 rounded-3xl p-4 border border-black/5 shadow-md"
            >
              <div className="flex justify-center">
                <Fahy3DMascot
                  level={level}
                  size={190}
                  interactive3D={true}
                  showDressUpBar={true}
                />
              </div>
              <p className="text-center text-[11px] text-forest/60 mt-2 font-medium">
                💡 Drag 360° or pick accessories above to complete daily quests!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Quest Category Filter Tabs */}
      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "All Quests", count: totalQuests },
            {
              id: "fahy_3d",
              label: "3D Fahy 🦖",
              count: quests.filter((q) => q.category === "fahy_3d").length,
            },
            {
              id: "exploration",
              label: "Exploration 🏙️",
              count: quests.filter((q) => q.category === "exploration").length,
            },
            {
              id: "community",
              label: "Community 💬",
              count: quests.filter((q) => q.category === "community").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? "bg-forest text-white shadow-sm scale-105"
                  : "bg-white text-forest/70 hover:bg-black/5 border border-black/5"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </section>

      {/* Quests List */}
      <section className="px-5 mt-3 space-y-3.5 pb-12">
        {filteredQuests.map((quest) => {
          const isDone = quest.current >= quest.targetCount;
          const isClaimed = quest.claimed;
          const progressPercent = Math.min(
            100,
            Math.round((quest.current / quest.targetCount) * 100),
          );

          return (
            <div
              key={quest.id}
              className={`bg-white p-5 rounded-3xl border transition-all shadow-xs ${
                isClaimed
                  ? "border-black/5 bg-gray-50/70 opacity-80"
                  : isDone
                    ? "border-emerald-500/50 bg-emerald-50/20 ring-1 ring-emerald-400/30 shadow-md"
                    : "border-black/5 hover:border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-forest/5 text-forest/80 border border-black/5"
                    }`}
                  >
                    <QuestIcon name={quest.iconName} className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          isDone ? "text-forest" : "text-forest/90"
                        }`}
                      >
                        {quest.title}
                      </h3>
                      {quest.category === "fahy_3d" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          3D Fahy
                        </span>
                      )}
                      {quest.category === "exploration" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          Urban
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-forest/60 mt-1 leading-relaxed">
                      {quest.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-display font-extrabold text-amber-600 text-sm">
                    +{formatCoins(quest.rewardCoins)}
                  </span>
                  <p className="text-[10px] text-forest/50 font-semibold">
                    +{quest.rewardXp} XP
                  </p>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-4">
                <div className="w-full">
                  <div className="flex items-center justify-between text-[11px] font-bold text-forest/60 mb-1">
                    <span>Progress</span>
                    <span>
                      {quest.current} / {quest.targetCount}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-forest/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDone ? "bg-emerald-500" : "bg-fahy-yellow"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action / Claim Button */}
                <div className="shrink-0 min-w-[110px]">
                  {isClaimed ? (
                    <div className="py-2 px-3 bg-forest/5 text-forest/50 font-bold text-xs rounded-2xl flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Claimed
                    </div>
                  ) : isDone ? (
                    <button
                      onClick={() => claimQuestReward(quest.id)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Claim Reward
                    </button>
                  ) : (
                    <Link
                      to={quest.actionRoute}
                      className="w-full py-2.5 px-3 bg-forest text-white hover:bg-forest/90 font-bold text-xs rounded-2xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{quest.actionText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
