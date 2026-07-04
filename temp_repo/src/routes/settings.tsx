import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang, LANGUAGES } from "@/lib/i18n";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { Check, Globe } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — The Fahy Hub" },
      { name: "description", content: "Language and preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { lang, setLang, k, formatCoins } = useLang();
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("settings.tag")}
        </p>
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-3xl tracking-tight">{k("settings.title")}</h1>
          <PixelFahy mood="curious" size={44} />
        </div>
      </header>

      <section className="px-5 mt-4">
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-sage-deep" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-forest/60">
              {k("settings.language")}
            </p>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((l) => {
              const active = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors active:scale-[0.99] ${
                    active
                      ? "bg-forest text-white border-forest"
                      : "bg-surface border-black/5 text-forest"
                  }`}
                >
                  <div className="text-left flex items-center gap-3">
                    <span className="text-xl leading-none">{l.flag}</span>
                    <div>
                      <p className="font-bold text-sm">{l.native}</p>
                      <p className={`text-[11px] ${active ? "text-white/70" : "text-forest/50"}`}>
                        {l.label} · {l.coin}
                      </p>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-fahy-yellow" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="bg-peach/15 border border-peach/30 rounded-3xl p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-forest/60 mb-1">
            {k("settings.preview")}
          </p>
          <p className="font-display font-bold text-2xl">{formatCoins("1,240")}</p>
        </div>
      </section>

      <div className="px-5 mt-6 flex items-center justify-around opacity-85">
        <PixelFahy mood="happy" size={36} />
        <PixelFahy mood="proud" size={40} />
        <PixelFahy mood="excited" size={36} />
        <PixelFahy mood="caring" size={38} />
      </div>
    </AppShell>
  );
}
