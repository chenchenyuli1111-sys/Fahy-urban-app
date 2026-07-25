import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Star, Lock, Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PixelFahy, type FahyEvolution } from "@/components/fahy/PixelFahy";
import { useAppState } from "@/lib/AppState";

export const Route = createFileRoute("/evolution")({
  head: () => ({
    meta: [{ title: "Fahy Evolution" }],
  }),
  component: EvolutionPage,
});

const stages: { level: number; id: FahyEvolution; name: string }[] = [
  { level: 1, id: "sprout", name: "The Sprout" },
  { level: 11, id: "potting_helper", name: "The Potting Helper" },
  { level: 21, id: "composter", name: "The Composter" },
  { level: 31, id: "community_gardener", name: "The Community Gardener" },
  { level: 41, id: "urban_gardener", name: "The Urban Gardener" },
  { level: 51, id: "soil_tester", name: "The Soil Tester" },
  { level: 61, id: "seed_librarian", name: "The Seed Librarian" },
  { level: 71, id: "pollinator_pal", name: "The Pollinator Pal" },
  { level: 81, id: "harvest_porter", name: "Harvest Porter" },
  { level: 91, id: "ecosystem_guardian", name: "Ecosystem Guardian" },
];

function EvolutionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { level, xp, equippedFahy, setEquippedFahy } = useAppState();

  const currentStage =
    stages.find((s) => s.id === equippedFahy) ||
    stages
      .slice()
      .reverse()
      .find((s) => level >= s.level) ||
    stages[0];

  const nextStage = stages.find((s) => s.level > level);
  const xpNeeded = nextStage ? nextStage.level * 100 : null;
  const progress = xpNeeded ? Math.min(100, (xp / xpNeeded) * 100) : 100;

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
          Fahy Evolution
        </h1>
        <p className="text-sm text-forest/60 mt-1">
          Watch your Fahy grow as you contribute to the community.
        </p>
      </header>

      <>
        <section className="px-5 mt-4">
          <div className="bg-gradient-to-b from-fahy-yellow/20 to-sage/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden border border-black/5">
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-forest shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 text-fahy-yellow fill-fahy-yellow" />
              Level {level}
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center mb-6 animate-float">
              <PixelFahy evolution={currentStage.id} size={160} />
            </div>

            <h2 className="font-display font-bold text-2xl text-forest text-center">
              {currentStage.name}
            </h2>

            <div className="w-full max-w-xs mt-6">
              <div className="flex justify-between text-xs font-bold text-forest/60 mb-2">
                <span>{xp} XP</span>
                <span>{xpNeeded ? `${xpNeeded} XP` : "MAX"}</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-black/5">
                <div
                  className="h-full bg-fahy-yellow transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {nextStage && (
                <p className="text-center text-xs text-forest/60 mt-3">
                  Next form unlocks at Level {nextStage.level}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="px-5 mt-10 pb-8">
          <h3 className="font-display font-bold text-xl mb-4">
            Evolution Catalog & Companion Choice
          </h3>
          <p className="text-xs text-forest/60 mb-6">
            Equip any unlocked Fahy form below to accompany you across your
            dashboard and map.
          </p>
          <div className="space-y-4 relative before:absolute before:inset-y-4 before:left-8 before:w-px before:bg-black/10">
            {stages.map((stage) => {
              const isUnlocked = level >= stage.level;
              const isCurrent = currentStage.id === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`relative flex items-center gap-5 p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-forest text-white shadow-md ring-2 ring-fahy-yellow/30"
                      : isUnlocked
                        ? "bg-white border border-black/5 hover:border-forest/20"
                        : "bg-forest/5 opacity-60"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                      isCurrent
                        ? "bg-fahy-yellow text-forest"
                        : isUnlocked
                          ? "bg-sage text-forest"
                          : "bg-forest/10 text-forest/40"
                    }`}
                  >
                    <PixelFahy
                      evolution={stage.id}
                      size={24}
                      className={!isUnlocked ? "grayscale opacity-50" : ""}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{stage.name}</h4>
                      {!isUnlocked && (
                        <Lock className="w-3 h-3 text-forest/40" />
                      )}
                    </div>
                    <p
                      className={`text-xs ${isCurrent ? "text-white/70" : "text-forest/50"}`}
                    >
                      Unlocks at Level {stage.level}
                    </p>
                  </div>

                  {isCurrent ? (
                    <div className="px-3 py-1 bg-fahy-yellow text-forest rounded-full text-xs font-black flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Active
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => setEquippedFahy(stage.id)}
                      className="px-3 py-1 bg-forest/5 hover:bg-forest/10 text-forest text-xs font-bold rounded-full transition-colors active:scale-95"
                    >
                      Equip
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-forest/40 uppercase tracking-widest px-2 py-1">
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </>
    </AppShell>
  );
}
