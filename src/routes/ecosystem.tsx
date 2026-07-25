import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { useLang } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import { Check } from "lucide-react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { EcoRadarScan } from "@/components/fahy/EcoRadarScan";
import { EcoAILab } from "@/components/fahy/EcoAILab";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "32x32 Eco-Challenge — The Fahy Hub" },
      {
        name: "description",
        content: "Track 32 local species across the neighborhood.",
      },
    ],
  }),
  component: Ecosystem,
});

const collection = Array.from({ length: 32 }).map((_, i) => ({
  id: i,
  unlocked: i < 12,
  state: i < 4 ? "final" : i < 8 ? "bloom" : i < 12 ? "bud" : "locked",
  lat: 22.3255 + (Math.random() - 0.5) * 0.005,
  lng: 114.1706 + (Math.random() - 0.5) * 0.005,
}));

function Ecosystem() {
  const { k } = useLang();
  const [showNodeSuccess, setShowNodeSuccess] = useState(false);

  const handleNodeClick = () => {
    setShowNodeSuccess(true);
  };

  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
  const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("eco.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("eco.title")}
        </h1>
      </header>

      <FahyGuide message={k("eco.guide")} mood="curious" />

      <section className="px-5 mt-6">
        <div className="relative bg-gradient-to-br from-sage/40 via-peach-soft to-fahy-yellow/30 rounded-3xl aspect-[4/3] overflow-hidden border border-black/5">
          {hasValidKey ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 22.3255, lng: 114.1706 }}
                defaultZoom={15}
                mapId="ECO_MAP_ID"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
                disableDefaultUI={true}
              >
                {collection.map((c) => {
                  if (c.state === "locked") return null;

                  let bg = "white";
                  if (c.state === "final") bg = "#FFD97D";
                  else if (c.state === "bloom") bg = "#2D4F3C";
                  else if (c.state === "bud") bg = "#6BBFA0";

                  return (
                    <AdvancedMarker
                      key={c.id}
                      position={{ lat: c.lat, lng: c.lng }}
                      onClick={
                        c.state === "final" ? handleNodeClick : undefined
                      }
                    >
                      <Pin
                        background={bg}
                        borderColor="transparent"
                        glyphColor={c.state === "final" ? "#2D4F3C" : "white"}
                      />
                    </AdvancedMarker>
                  );
                })}
              </Map>
            </APIProvider>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <div>
                <p className="font-bold text-sm mb-1 text-forest">
                  Map requires API Key
                </p>
                <p className="text-xs text-forest/60">
                  Add GOOGLE_MAPS_PLATFORM_KEY to secrets to view the 32x32
                  challenge map.
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-sage-deep" />{" "}
            {k("common.unlocked")}
            <span className="w-2 h-2 rounded-full bg-forest ml-2" />{" "}
            {k("eco.legend.final")}
          </div>
        </div>
      </section>

      {/* The unified EcoRadarScan component manages all scanning/listening/photo-taking modes */}
      <section className="px-5 mt-6">
        <EcoRadarScan />
      </section>

      {/* Advanced Gemini Pro Eco-AI Laboratory */}
      <section className="px-5 mt-6">
        <EcoAILab />
      </section>

      <section className="px-5 mt-8 pb-10">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none">
            {k("eco.book")}
          </h2>
          <span className="text-[11px] font-semibold text-forest/40">
            12 / 32
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {collection.map((c) => (
            <div
              key={c.id}
              className={`aspect-square rounded-2xl border grid place-items-center ${
                c.unlocked
                  ? "bg-white border-black/5 shadow-xs cursor-pointer active:scale-95 animate-fade-in"
                  : "bg-slate-100/50 border-dashed border-slate-300"
              }`}
              onClick={c.state === "final" ? handleNodeClick : undefined}
            >
              {c.state === "final" && (
                <div className="w-9 h-9 rounded-full bg-peach grid place-items-center text-[8px] font-bold text-white">
                  ★
                </div>
              )}
              {c.state === "bloom" && (
                <div className="w-8 h-8 rounded-full bg-sage-deep/70" />
              )}
              {c.state === "bud" && (
                <div className="w-5 h-5 rounded-full bg-sage" />
              )}
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
            <span className="w-2 h-2 rounded-full bg-sage-deep" />{" "}
            {k("eco.bloom")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-peach" /> {k("eco.final")}
          </span>
        </p>
      </section>

      {showNodeSuccess && (
        <div
          onClick={() => setShowNodeSuccess(false)}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xs text-center border border-black/5"
          >
            <div className="w-12 h-12 bg-sage/30 text-sage-deep rounded-full grid place-items-center mx-auto mb-3">
              <Check className="w-6 h-6 animate-pulse" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg text-peach mb-1 mt-4">
              Glowing Node Tapped!
            </p>
            <p className="text-xs text-forest/60 mb-4 leading-relaxed">
              You found a special node in the ecosystem. This species is fully
              bloomed! You earned a rare badge fragment.
            </p>
            <button
              onClick={() => setShowNodeSuccess(false)}
              className="bg-peach text-white font-bold text-sm px-6 py-2 rounded-full w-full cursor-pointer hover:bg-peach/90"
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
