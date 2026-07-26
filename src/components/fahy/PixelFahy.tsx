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

export const EVOLUTION_IMAGES: Record<FahyEvolution, string> = {
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

// Global transparent image cache
const transparentImageCache = new Map<string, string>();

/**
 * Automatically removes white and near-white background pixels from a JPEG image source
 * using HTML5 Canvas pixel manipulation, returning a clean transparent PNG data URL.
 */
export function getTransparentImage(imageSrc: string): Promise<string> {
  if (!imageSrc) return Promise.resolve("");
  if (transparentImageCache.has(imageSrc)) {
    return Promise.resolve(transparentImageCache.get(imageSrc)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    // Only set crossOrigin if external http/https URL
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // Threshold for white & off-white background removal
        const whiteThreshold = 200;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
            const avg = (r + g + b) / 3;
            if (avg > 225) {
              data[i + 3] = 0; // Completely transparent
            } else {
              // Smooth feathering at the edges
              const alpha = Math.max(
                0,
                Math.floor(255 - (avg - whiteThreshold) * 10),
              );
              data[i + 3] = Math.min(data[i + 3], alpha);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        transparentImageCache.set(imageSrc, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        console.warn("Failed to process transparent mascot image:", err);
        resolve(imageSrc);
      }
    };

    img.onerror = (err) => {
      console.warn("Error loading image for transparent conversion:", err);
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}

export function useTransparentMascot(rawSrc: string): string {
  const [src, setSrc] = useState<string>(
    transparentImageCache.get(rawSrc) || rawSrc,
  );

  useEffect(() => {
    let isMounted = true;
    if (rawSrc) {
      getTransparentImage(rawSrc).then((processed) => {
        if (isMounted) {
          setSrc(processed);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [rawSrc]);

  return src;
}

export function PreloadFahyAssets() {
  useEffect(() => {
    Object.values(EVOLUTION_IMAGES).forEach((src) => {
      getTransparentImage(src);
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
  const rawSrc = EVOLUTION_IMAGES[currentEvo];
  const transparentSrc = useTransparentMascot(rawSrc);

  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 600);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-transparent transition-all duration-300 ${interactive ? "cursor-pointer hover:scale-105" : ""} ${className} ${isInteracting ? "scale-95 -rotate-3" : ""}`}
      style={{ width: size, height: size }}
      title={currentEvo.replace("_", " ").toUpperCase()}
      onClick={handleInteraction}
    >
      <img
        src={transparentSrc}
        alt={currentEvo}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm transition-opacity duration-200"
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
