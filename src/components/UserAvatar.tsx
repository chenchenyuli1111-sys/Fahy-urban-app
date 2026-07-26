import React, { useState } from "react";
import {
  PixelFahy,
  getEvolutionForLevel,
  type FahyEvolution,
} from "@/components/fahy/PixelFahy";

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string;
  evolution?: FahyEvolution | string;
  level?: number;
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  fallbackToFahy?: boolean;
}

export function UserAvatar({
  photoURL,
  name = "Explorer",
  evolution,
  level = 1,
  size = "md",
  className = "",
  fallbackToFahy = true,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Compute size in px
  let dimensionPx = 40;
  if (typeof size === "number") {
    dimensionPx = size;
  } else {
    switch (size) {
      case "sm":
        dimensionPx = 32;
        break;
      case "md":
        dimensionPx = 44;
        break;
      case "lg":
        dimensionPx = 64;
        break;
      case "xl":
        dimensionPx = 88;
        break;
    }
  }

  // Determine current evolution based on explicit evolution prop or player level
  const currentEvo: FahyEvolution =
    (evolution && evolution !== "gen0"
      ? (evolution as FahyEvolution)
      : undefined) || getEvolutionForLevel(level);

  // If player has uploaded a profile picture and it loads successfully
  if (photoURL && photoURL.trim() !== "" && !imgError) {
    return (
      <div
        style={{ width: dimensionPx, height: dimensionPx }}
        className={`relative rounded-2xl overflow-hidden bg-forest/5 border border-black/10 flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <img
          src={photoURL}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    );
  }

  // Default: Level-based Fahy Mascot with transparent background
  if (fallbackToFahy) {
    return (
      <div
        style={{ width: dimensionPx, height: dimensionPx }}
        className={`relative rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1 flex-shrink-0 shadow-xs ${className}`}
      >
        <PixelFahy
          evolution={currentEvo}
          size={Math.floor(dimensionPx * 0.85)}
          interactive={false}
        />
      </div>
    );
  }

  // Fallback initial avatar
  const initial = name ? name.charAt(0).toUpperCase() : "E";
  return (
    <div
      style={{ width: dimensionPx, height: dimensionPx }}
      className={`rounded-2xl bg-forest text-fahy-yellow font-display font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-xs ${className}`}
    >
      {initial}
    </div>
  );
}
