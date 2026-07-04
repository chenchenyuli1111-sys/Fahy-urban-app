import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { useLang } from "@/lib/i18n";
import { QrCode, Ear, X } from "lucide-react";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "32x32 Eco-Challenge — The Fahy Hub" },
      { name: "description", content: "Track 32 local species across the neighborhood." },
    ],
  }),
  component: Ecosystem,
});

const collection = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  unlocked: i < 12,
  state: i < 4 ? "final" : i < 8 ? "bloom" : i < 12 ? "bud" : "locked",
}));

function Ecosystem() {
  const [listening, setListening] = useState(false);
  const { k } = useLang();
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("eco.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">{k("eco.title")}</h1>
      </header>

      <FahyGuide message={k("eco.guide")} mood="curious" />

      <section className="px-5 mt-6">
        <div className="relative bg-gradient-to-br from-sage/40 via-peach-soft to-fahy-yellow/30 rounded-3xl aspect-[4/3] overflow-hidden border border-black/5">
          <PixelFahy mood="caring" size={44} className="absolute top-2 right-3 z-10" />
          <PixelFahy mood="happy" size={36} className="absolute bottom-12 left-3 z-10 opacity-80" />
          <svg viewBox="0 0 320 240" className="absolute inset-0 w-full h-full">
            <path
              d="M20 180 Q80 60 160 120 T300 80"
              stroke="#2D4F3C"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.25"
            />
            {Array.from({ length: 32 }).map((_, i) => {
              const x = 20 + (i % 8) * 38 + (Math.floor(i / 8) % 2) * 12;
              const y = 30 + Math.floor(i / 8) * 50;
              const unlocked = i < 12;
              const final = i < 4;
              return (
                <g key={i}>
                  {final && (
                    <circle cx={x} cy={y} r="10" fill="#FFD97D" opacity="0.4">
                      <animate
                        attributeName="r"
                        values="8;14;8"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={final ? "#2D4F3C" : unlocked ? "#6BBFA0" : "white"}
                    stroke={unlocked ? "#2D4F3C" : "#cbd5e1"}
                    strokeWidth="1.5"
                    strokeDasharray={unlocked ? "0" : "2 2"}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-deep" /> {k("common.unlocked")}
            <span className="w-2 h-2 rounded-full bg-forest ml-2" /> {k("eco.legend.final")}
          </div>
        </div>
      </section>

      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        <button className="bg-forest text-white p-4 rounded-3xl flex flex-col items-start gap-3 active:scale-[0.98] transition-transform">
          <QrCode className="w-5 h-5 text-fahy-yellow" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
              {k("eco.action.track")}
            </p>
            <p className="text-sm font-bold">{k("eco.action.qr")}</p>
          </div>
        </button>
        <button
          onClick={() => setListening(true)}
          className="bg-peach/20 border border-peach/40 p-4 rounded-3xl flex flex-col items-start gap-3 active:scale-[0.98] transition-transform"
        >
          <Ear className="w-5 h-5 text-peach" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-forest/50 font-bold">
              {k("eco.action.listen")}
            </p>
            <p className="text-sm font-bold">{k("eco.action.silent")}</p>
          </div>
        </button>
      </section>

      <section className="px-5 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none">{k("eco.book")}</h2>
          <span className="text-[11px] font-semibold text-forest/40">12 / 32</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {collection.map((c) => (
            <div
              key={c.id}
              className={`aspect-square rounded-2xl border grid place-items-center ${
                c.unlocked
                  ? "bg-white border-black/5 shadow-xs"
                  : "bg-slate-100/50 border-dashed border-slate-300"
              }`}
            >
              {c.state === "final" && (
                <div className="w-9 h-9 rounded-full bg-peach grid place-items-center text-[8px] font-bold text-white">
                  ★
                </div>
              )}
              {c.state === "bloom" && <div className="w-8 h-8 rounded-full bg-sage-deep/70" />}
              {c.state === "bud" && <div className="w-5 h-5 rounded-full bg-sage" />}
              {c.state === "locked" && (
                <span className="text-[10px] font-bold text-slate-400">?</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-forest/50 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sage" /> {k("eco.bud")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sage-deep" /> {k("eco.bloom")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-peach" /> {k("eco.final")}
          </span>
        </p>
      </section>

      <div className="px-5 mt-6 flex items-center justify-around opacity-80">
        <PixelFahy mood="happy" size={36} />
        <PixelFahy mood="curious" size={40} className="-rotate-6" />
        <PixelFahy mood="excited" size={36} className="rotate-6" />
      </div>

      {listening && (
        <div className="fixed inset-0 z-50 bg-forest/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <button
            onClick={() => setListening(false)}
            className="absolute top-6 right-6 w-10 h-10 grid place-items-center bg-white/10 rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <PixelFahy mood="listening" size={96} className="mb-4" />
          <p className="text-fahy-yellow text-[10px] uppercase tracking-widest font-bold mb-2">
            {k("eco.listening.tag")}
          </p>
          <p className="text-white font-display text-xl mb-8">{k("eco.listening.detected")}</p>
          <div className="flex items-end gap-1.5 h-32">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-fahy-yellow rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%`,
                  animationDelay: `${i * 60}ms`,
                  animationDuration: "1.2s",
                }}
              />
            ))}
          </div>
          <p className="text-white/60 text-xs mt-8 max-w-[260px] text-center">
            {k("eco.listening.hint")}
          </p>
        </div>
      )}
    </AppShell>
  );
}
