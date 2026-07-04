import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CoCreatorStrip } from "@/components/fahy/CoCreatorStrip";
import { useLang, type DictKey } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import {
  AchievementBadge,
  BADGES_REGISTRY,
} from "@/components/fahy/AchievementBadge";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { QrCode, Sparkles, Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Peach Blossom Wallet — The Fahy Hub" },
      {
        name: "description",
        content:
          "Your 桃源幣 wallet, sustainability impact, and seasonal rewards.",
      },
    ],
  }),
  component: Wallet,
});

const rewards: {
  key: DictKey;
  cost: number;
  tone: "peach" | "yellow" | "sage" | "forest";
  emoji: string;
}[] = [
  { key: "wallet.reward.tea", cost: 240, tone: "peach", emoji: "🍵" },
  { key: "wallet.reward.blind", cost: 480, tone: "yellow", emoji: "🎁" },
  { key: "wallet.reward.cam", cost: 120, tone: "sage", emoji: "📸" },
  { key: "wallet.reward.coaster", cost: 360, tone: "forest", emoji: "🧉" },
];

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  type: string;
  timestamp: { toDate: () => Date } | null;
}

function Wallet() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTxLoading(false);
      return;
    }
    setTxLoading(true);
    setTxError(null);
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(5),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        setTransactions(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as unknown as Transaction),
          })),
        );
        setTxLoading(false);
      },
      (err) => {
        console.error("Error loading transactions:", err);
        setTxError("Failed to fetch transaction history.");
        setTxLoading(false);
      },
    );
  }, [user]);
  const { formatCoins, k } = useLang();
  const { coins, deductCoins, unlockedBadges, equippedBadge } = useAppState();

  const handleRedeem = async (reward: (typeof rewards)[0]) => {
    const success = await deductCoins(reward.cost, k(reward.key));
    if (success) {
      alert("Successfully redeemed! Item will be shipped or activated.");
    } else {
      alert("Not enough coins!");
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("wallet.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("wallet.title")}
        </h1>
      </header>

      <section className="px-5 mt-4">
        <div className="bg-gradient-to-br from-peach via-peach/80 to-fahy-yellow rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full" />
          <div className="absolute top-20 -right-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/80">
              {k("wallet.balance")}
            </p>
            <p className="font-display font-bold text-4xl text-white mt-1 leading-tight">
              {formatCoins(coins.toLocaleString())}
            </p>
            <Link
              to="/tasks"
              className="mt-5 bg-forest text-white text-xs font-bold px-4 py-2.5 rounded-full inline-flex items-center gap-2 active:scale-95 transition-transform"
            >
              <QrCode className="w-4 h-4" /> Earn More Points
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6 relative">
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-sage-deep" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-forest/60">
              {k("wallet.tracker.tag")}
            </p>
          </div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-display font-bold text-3xl">4.2 kg</p>
              <p className="text-[11px] text-forest/50">
                {k("wallet.tracker.saved")}
              </p>
            </div>
            <p className="text-[11px] font-bold text-sage-deep">
              {k("wallet.tracker.vs")}
            </p>
          </div>
          <div className="h-2 bg-sage/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sage-deep to-sage rounded-full w-[68%]" />
          </div>
          <p className="text-[10px] text-forest/40 mt-2">
            {k("wallet.tracker.goal")}
          </p>
        </div>
      </section>

      {/* Dynamic Artisan Badges & Achievements Section */}
      <section className="px-5 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none flex items-center gap-2">
            <Award className="w-4 h-4 text-fahy-yellow fill-fahy-yellow" /> My
            Artisan Badges
          </h2>
          <span className="text-[11px] font-semibold text-forest/40">
            {unlockedBadges.length} / 18 Unlocked
          </span>
        </div>

        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs overflow-hidden">
          <div className="flex gap-4 pb-2 pt-1 overflow-x-auto scrollbar-none snap-x">
            {Object.keys(BADGES_REGISTRY).map((badgeKey) => {
              const isUnlocked = unlockedBadges.includes(badgeKey);
              const isEquipped = equippedBadge === badgeKey;
              return (
                <div
                  key={badgeKey}
                  className="flex flex-col items-center flex-shrink-0 snap-center min-w-[70px]"
                >
                  <AchievementBadge
                    badgeKey={badgeKey}
                    size="sm"
                    unlocked={isUnlocked}
                    equipped={isEquipped}
                    showTooltip={true}
                    showRibbons={false}
                  />
                  <p className="text-[9px] font-bold text-center mt-2 max-w-[68px] truncate text-forest/70">
                    {BADGES_REGISTRY[badgeKey].name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-peach" /> Seasonal Rewards Store
          </h2>
          <span className="text-[11px] font-semibold text-forest/40">
            {k("wallet.spring_drop")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((r) => {
            const bg =
              r.tone === "peach"
                ? "bg-peach/10"
                : r.tone === "yellow"
                  ? "bg-fahy-yellow/20"
                  : r.tone === "sage"
                    ? "bg-sage/20"
                    : "bg-forest text-white";
            const border =
              r.tone === "peach"
                ? "border-peach/20"
                : r.tone === "yellow"
                  ? "border-fahy-yellow/30"
                  : r.tone === "sage"
                    ? "border-sage/30"
                    : "border-forest";
            return (
              <button
                onClick={() => handleRedeem(r)}
                key={r.key}
                className={`${bg} rounded-3xl p-4 border ${border} active:scale-95 transition-transform text-left cursor-pointer disabled:opacity-50 flex flex-col items-center justify-center text-center`}
                disabled={coins < r.cost}
              >
                <div className="text-4xl mb-3 drop-shadow-sm">{r.emoji}</div>
                <p className="text-xs font-bold">{k(r.key)}</p>
                <p
                  className={`text-[10px] mt-1 font-bold ${r.tone === "forest" ? "text-fahy-yellow" : "text-forest/70"}`}
                >
                  {formatCoins(r.cost)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-8">
        <h2 className="font-display font-bold text-lg leading-none mb-4">
          Transaction History
        </h2>
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
          {txError ? (
            <p className="text-xs text-peach font-semibold text-center py-2">
              {txError}
            </p>
          ) : txLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="space-y-1.5 w-2/3">
                    <div className="h-4 bg-forest/10 rounded-md w-3/4" />
                    <div className="h-3 bg-forest/5 rounded-md w-1/3" />
                  </div>
                  <div className="h-4 bg-forest/10 rounded-md w-8" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-forest/50 text-center">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{tx.reason}</p>
                    <p className="text-[10px] text-forest/50">
                      {tx.timestamp?.toDate().toLocaleString() || "Just now"}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${tx.amount > 0 ? "text-sage-deep" : "text-peach"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="mt-8">
        <CoCreatorStrip />
      </div>
    </AppShell>
  );
}
