import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CoCreatorStrip } from "@/components/fahy/CoCreatorStrip";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { useLang, type DictKey } from "@/lib/i18n";
import { QrCode, Sparkles, Leaf } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Peach Blossom Wallet — The Fahy Hub" },
      {
        name: "description",
        content: "Your 桃源幣 wallet, sustainability impact, and seasonal rewards.",
      },
    ],
  }),
  component: Wallet,
});

const rewards: { key: DictKey; cost: number; tone: "peach" | "yellow" | "sage" | "forest" }[] = [
  { key: "wallet.reward.tea", cost: 240, tone: "peach" },
  { key: "wallet.reward.blind", cost: 480, tone: "yellow" },
  { key: "wallet.reward.cam", cost: 120, tone: "sage" },
  { key: "wallet.reward.coaster", cost: 360, tone: "forest" },
];

function Wallet() {
  const { formatCoins, k } = useLang();
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("wallet.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">{k("wallet.title")}</h1>
      </header>

      <section className="px-5 mt-4">
        <div className="bg-gradient-to-br from-peach via-peach/80 to-fahy-yellow rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full" />
          <div className="absolute top-20 -right-4 w-16 h-16 bg-white/10 rounded-full" />
          <PixelFahy mood="excited" size={64} className="absolute top-3 right-3 z-10" />
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/80">
              {k("wallet.balance")}
            </p>
            <p className="font-display font-bold text-4xl text-white mt-1 leading-tight">
              {formatCoins("1,240")}
            </p>
            <button className="mt-5 bg-forest text-white text-xs font-bold px-4 py-2.5 rounded-full inline-flex items-center gap-2 active:scale-95 transition-transform">
              <QrCode className="w-4 h-4" /> {k("wallet.redeem_qr")}
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6 relative">
        <PixelFahy mood="caring" size={44} className="absolute -top-3 -right-1 z-10 rotate-6" />
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
              <p className="text-[11px] text-forest/50">{k("wallet.tracker.saved")}</p>
            </div>
            <p className="text-[11px] font-bold text-sage-deep">{k("wallet.tracker.vs")}</p>
          </div>
          <div className="h-2 bg-sage/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sage-deep to-sage rounded-full w-[68%]" />
          </div>
          <p className="text-[10px] text-forest/40 mt-2">{k("wallet.tracker.goal")}</p>
        </div>
      </section>

      <section className="px-5 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-peach" /> {k("wallet.rewards")}
          </h2>
          <span className="text-[11px] font-semibold text-forest/40">
            {k("wallet.spring_drop")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((r) => {
            const bg =
              r.tone === "peach"
                ? "bg-peach/20"
                : r.tone === "yellow"
                  ? "bg-fahy-yellow/30"
                  : r.tone === "sage"
                    ? "bg-sage/30"
                    : "bg-forest text-white";
            const dot =
              r.tone === "peach"
                ? "bg-peach"
                : r.tone === "yellow"
                  ? "bg-fahy-yellow"
                  : r.tone === "sage"
                    ? "bg-sage-deep"
                    : "bg-fahy-yellow";
            return (
              <div key={r.key} className={`${bg} rounded-3xl p-4 border border-black/5`}>
                <div className={`w-12 h-12 rounded-2xl ${dot} mb-3`} />
                <p className="text-xs font-bold">{k(r.key)}</p>
                <p className="text-[10px] mt-1 opacity-70">{formatCoins(r.cost)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="px-5 mt-6 flex items-center justify-around opacity-85">
        <PixelFahy mood="happy" size={36} />
        <PixelFahy mood="proud" size={42} />
        <PixelFahy mood="sleepy" size={36} className="rotate-6" />
      </div>

      <div className="mt-8">
        <CoCreatorStrip />
      </div>
    </AppShell>
  );
}
