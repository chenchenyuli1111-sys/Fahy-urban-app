import { useState, useEffect } from "react";
import sproutImg from "@/assets/images/fahy_sprout_new_1782930613805.jpg";
import pottingHelperImg from "@/assets/images/fahy_potting_new_1782930623114.jpg";
import composterImg from "@/assets/images/fahy_composter_new_1782930634086.jpg";
import communityGardenerImg from "@/assets/images/fahy_community_new_1782930642320.jpg";
import urbanGardenerImg from "@/assets/images/fahy_urban_new_1782930649770.jpg";
import seedLibrarianImg from "@/assets/images/fahy_librarian_new_1782930662533.jpg";
import soilTesterImg from "@/assets/images/fahy_soil_new_1782930671696.jpg";
import pollinatorPalImg from "@/assets/images/fahy_pollinator_new_1782930678848.jpg";
import harvestPorterImg from "@/assets/images/fahy_porter_new_1782930688561.jpg";
import ecosystemGuardianImg from "@/assets/images/fahy_guardian_new_1782930698388.jpg";

export type FahyEvolution =
  | "sprout"
  | "potting_helper"
  | "composter"
  | "community_gardener"
  | "urban_gardener"
  | "seed_librarian"
  | "soil_tester"
  | "pollinator_pal"
  | "harvest_porter"
  | "ecosystem_guardian";

export function getEvolutionForLevel(level: number): FahyEvolution {
  if (level >= 91) return "ecosystem_guardian";
  if (level >= 81) return "harvest_porter";
  if (level >= 71) return "pollinator_pal";
  if (level >= 61) return "seed_librarian";
  if (level >= 51) return "soil_tester";
  if (level >= 41) return "urban_gardener";
  if (level >= 31) return "community_gardener";
  if (level >= 21) return "composter";
  if (level >= 11) return "potting_helper";
  return "sprout";
}

const EVOLUTION_IMAGES: Record<FahyEvolution, string> = {
  sprout: sproutImg,
  potting_helper: pottingHelperImg,
  composter: composterImg,
  community_gardener: communityGardenerImg,
  urban_gardener: urbanGardenerImg,
  seed_librarian: seedLibrarianImg,
  soil_tester: soilTesterImg,
  pollinator_pal: pollinatorPalImg,
  harvest_porter: harvestPorterImg,
  ecosystem_guardian: ecosystemGuardianImg,
};

export function PreloadFahyAssets() {
  useEffect(() => {
    Object.values(EVOLUTION_IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  return null;
}

export function PixelFahy({
  evolution,
  level,
  size = 48,
  className = "",
  interactive = true,
}: {
  evolution?: FahyEvolution;
  level?: number;
  size?: number;
  className?: string;
  interactive?: boolean;
}) {
  const currentEvo =
    evolution || (level ? getEvolutionForLevel(level) : "sprout");
  const imgSrc = EVOLUTION_IMAGES[currentEvo];

  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 600);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-transparent transition-all duration-300 mix-blend-multiply ${interactive ? "cursor-pointer hover:scale-105" : ""} ${className} ${isInteracting ? "scale-95 -rotate-3" : ""}`}
      style={{ width: size, height: size, mixBlendMode: "multiply" }}
      title={currentEvo.replace("_", " ").toUpperCase()}
      onClick={handleInteraction}
    >
      <img
        src={imgSrc}
        alt={currentEvo}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain select-none pointer-events-none contrast-125 brightness-105"
        style={{ backgroundColor: "transparent" }}
        draggable={false}
      />

      {isInteracting && (
        <div className="absolute top-0 right-0 animate-bounce pointer-events-none">
          <span className="text-xl drop-shadow-md">✨</span>
        </div>
      )}
    </div>
  );
}

export function ScatteredFahys() {
  const fahys: {
    evo: FahyEvolution;
    top: string;
    left: string;
    delay: string;
    size: number;
  }[] = [
    { evo: "sprout", top: "10%", left: "5%", delay: "0s", size: 32 },
    { evo: "potting_helper", top: "25%", left: "85%", delay: "1s", size: 40 },
    { evo: "composter", top: "45%", left: "10%", delay: "2s", size: 48 },
    {
      evo: "community_gardener",
      top: "60%",
      left: "90%",
      delay: "0.5s",
      size: 56,
    },
    { evo: "urban_gardener", top: "80%", left: "15%", delay: "1.5s", size: 64 },
    { evo: "pollinator_pal", top: "15%", left: "75%", delay: "2.5s", size: 48 },
    {
      evo: "ecosystem_guardian",
      top: "85%",
      left: "80%",
      delay: "3s",
      size: 72,
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {fahys.map((f, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-30 mix-blend-multiply pointer-events-none"
          style={{
            top: f.top,
            left: f.left,
            animationDelay: f.delay,
            animationDuration: `${3 + i}s`,
          }}
        >
          <PixelFahy evolution={f.evo} size={f.size} interactive={false} />
        </div>
      ))}
    </div>
  );
}
