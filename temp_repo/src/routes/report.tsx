import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { useLang, type DictKey } from "@/lib/i18n";
import { Camera, MapPin, Trash2, Sprout, AlertTriangle, Check } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Eco-Debt Reporter — The Fahy Hub" },
      {
        name: "description",
        content: "Report & restore environmental issues in your neighborhood.",
      },
    ],
  }),
  component: Report,
});

const recent: { kindKey: DictKey; whereKey: DictKey; restored: boolean; icon: typeof Trash2 }[] = [
  { kindKey: "report.cat.trash", whereKey: "report.where.heritage", restored: true, icon: Trash2 },
  { kindKey: "report.cat.decay", whereKey: "report.where.lane24", restored: false, icon: Sprout },
  { kindKey: "report.cat.trash", whereKey: "report.where.west", restored: true, icon: Trash2 },
];

function Report() {
  const [submitted, setSubmitted] = useState(false);
  const { formatCoins, k } = useLang();
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("report.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">{k("report.title")}</h1>
      </header>

      <FahyGuide mood="sad" message={k("report.guide", { coins: formatCoins(5) })} />

      <section className="px-5 mt-6 relative">
        <PixelFahy mood="caring" size={44} className="absolute -top-2 right-3 z-10 -rotate-6" />
        <button
          onClick={() => setSubmitted(true)}
          className="w-full bg-forest text-white rounded-3xl p-6 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-lg"
        >
          <div className="w-14 h-14 bg-fahy-yellow/20 rounded-2xl grid place-items-center">
            <AlertTriangle className="w-7 h-7 text-fahy-yellow" strokeWidth={2.4} />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-xl leading-tight">{k("report.cta.title")}</p>
            <p className="text-[11px] text-white/60 mt-0.5">{k("report.cta.sub")}</p>
          </div>
        </button>
      </section>

      <section className="px-5 mt-5">
        <div className="bg-white border border-black/5 rounded-3xl p-4 shadow-xs">
          <div className="aspect-video bg-gradient-to-br from-peach-soft to-sage/30 rounded-2xl grid place-items-center border-2 border-dashed border-peach/40 mb-3">
            <div className="text-center">
              <Camera className="w-7 h-7 text-peach mx-auto mb-1" />
              <p className="text-xs font-bold text-forest/70">{k("report.capture")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-sage/30 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 25.0330° N
            </span>
            <span className="bg-peach/20 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.trash")}
            </span>
            <span className="bg-fahy-yellow/30 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.decay")}
            </span>
            <span className="bg-slate-100 text-forest/50 text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.other")}
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-8">
        <h2 className="font-display font-bold text-lg mb-4">{k("report.recent")}</h2>
        <div className="space-y-3">
          {recent.map((r, i) => {
            const Icon = r.icon;
            const done = r.restored;
            return (
              <div
                key={i}
                className="bg-white border border-black/5 rounded-2xl p-4 flex items-center gap-3 shadow-xs"
              >
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center ${
                    done ? "bg-sage/30 text-sage-deep" : "bg-peach/20 text-peach"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{k(r.kindKey)}</p>
                  <p className="text-[10px] text-forest/50">{k(r.whereKey)}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    done ? "bg-sage-deep text-white" : "bg-fahy-yellow text-forest"
                  }`}
                >
                  {done ? k("report.status.restored") : k("report.status.review")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="px-5 mt-6 flex items-center justify-around opacity-85">
        <PixelFahy mood="sad" size={36} />
        <PixelFahy mood="curious" size={40} className="-rotate-6" />
        <PixelFahy mood="happy" size={42} className="rotate-6" />
        <PixelFahy mood="proud" size={36} />
      </div>

      {submitted && (
        <div
          onClick={() => setSubmitted(false)}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 mx-6 max-w-xs text-center">
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center">
              <PixelFahy mood="excited" size={64} />
            </div>
            <p className="font-display font-bold text-lg flex items-center justify-center gap-1">
              <Check className="w-5 h-5 text-sage-deep" strokeWidth={3} /> {k("report.sent")}
            </p>
            <p className="text-xs text-forest/60 mt-1">
              +{k("report.added", { coins: formatCoins(5) })}
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
