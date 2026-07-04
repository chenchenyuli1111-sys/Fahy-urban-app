import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { useLang, type DictKey } from "@/lib/i18n";
import { MapPin, Play, Lock, ScanLine } from "lucide-react";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Artisan Path — The Fahy Hub" },
      {
        name: "description",
        content: "Collect badges from local artisans and unlock oral histories.",
      },
    ],
  }),
  component: Culture,
});

const badges: { key: DictKey; emoji: string; unlocked: boolean }[] = [
  { key: "culture.badge.tea_master", emoji: "茶", unlocked: true },
  { key: "culture.badge.indigo", emoji: "藍", unlocked: true },
  { key: "culture.badge.bamboo", emoji: "竹", unlocked: true },
  { key: "culture.badge.paper", emoji: "紙", unlocked: true },
  { key: "culture.badge.pottery", emoji: "陶", unlocked: true },
  { key: "culture.badge.iron", emoji: "鐵", unlocked: false },
  { key: "culture.badge.carving", emoji: "刻", unlocked: false },
  { key: "culture.badge.lantern", emoji: "燈", unlocked: false },
];

const shops: { nameKey: DictKey; dist: string; certKey: DictKey }[] = [
  { nameKey: "culture.shop.lin", dist: "120m", certKey: "culture.badge.tea_master" },
  { nameKey: "culture.shop.old", dist: "340m", certKey: "culture.badge.indigo" },
  { nameKey: "culture.shop.bamboo", dist: "510m", certKey: "culture.badge.bamboo" },
];

function Culture() {
  const { k } = useLang();
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("culture.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">{k("culture.title")}</h1>
      </header>

      <FahyGuide message={k("culture.guide")} mood="proud" />

      <section className="px-5 mt-6">
        <div className="bg-gradient-to-br from-forest to-forest/80 text-white rounded-3xl p-5 relative overflow-hidden">
          <PixelFahy mood="proud" size={48} className="absolute -top-2 right-2 z-10 rotate-6" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-fahy-yellow/80">
                {k("culture.passport")}
              </p>
              <p className="font-display text-2xl font-bold mt-1">
                {k("culture.badges_progress", { a: 5, b: 12 })}
              </p>
            </div>
            <div className="w-14 h-14 bg-fahy-yellow/15 rounded-2xl grid place-items-center text-fahy-yellow font-bold text-xl">
              桃
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {badges.map((b) => (
              <div
                key={b.key}
                className={`aspect-square rounded-2xl grid place-items-center text-center ${
                  b.unlocked ? "bg-fahy-yellow text-forest" : "bg-white/5 text-white/30"
                }`}
              >
                <div>
                  <p className="text-lg font-display font-bold">{b.emoji}</p>
                  <p className="text-[8px] font-bold uppercase leading-tight">{k(b.key)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 mt-8">
        <h2 className="font-display font-bold text-lg mb-4">{k("culture.centers")}</h2>
        <div className="space-y-3">
          {shops.map((s) => (
            <div
              key={s.nameKey}
              className="bg-white border border-black/5 rounded-2xl p-4 flex items-center gap-3 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-peach/20 grid place-items-center text-peach">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{k(s.nameKey)}</p>
                <p className="text-[10px] text-forest/50">
                  {k(s.certKey)} · {s.dist} {k("culture.away")}
                </p>
              </div>
              <button className="bg-forest text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <ScanLine className="w-3 h-3" /> {k("common.scan")}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-8 mb-4">
        <h2 className="font-display font-bold text-lg mb-4">{k("culture.oral")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-xs">
            <div className="aspect-video bg-gradient-to-br from-peach to-fahy-yellow grid place-items-center">
              <PixelFahy mood="listening" size={56} />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold flex items-center gap-1">
                <Play className="w-3 h-3" /> {k("culture.oral.tea")}
              </p>
              <p className="text-[10px] text-forest/50 mt-0.5">{k("culture.oral.tea_meta")}</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-xs">
            <div className="aspect-video bg-slate-100 grid place-items-center">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold">{k("culture.oral.indigo")}</p>
              <p className="text-[10px] text-forest/50 mt-0.5">{k("culture.oral.indigo_meta")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 mt-6 mb-4 flex items-center justify-around opacity-85">
        <PixelFahy mood="caring" size={40} />
        <PixelFahy mood="happy" size={36} className="-rotate-6" />
        <PixelFahy mood="excited" size={42} className="rotate-3" />
      </div>
    </AppShell>
  );
}
