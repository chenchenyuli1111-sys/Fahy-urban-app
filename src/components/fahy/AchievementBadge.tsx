import * as React from "react";
import { Lock, Compass, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Registry of all traditional artisan & onboarding achievements in the Fahy Hub
export interface BadgeDetails {
  key: string;
  name: string;
  emoji: string;
  level: "I" | "II" | "III";
  rarity: "Common" | "Uncommon" | "Rare" | "Legendary";
  description: string;
  requirement: string;
  color: string;       // Custom hex from design system
  ribbonColor: string; // Tail color hex
  trackName: string;
}

export const BADGES_REGISTRY: Record<string, BadgeDetails> = {
  // Onboarding Track
  "culture.badge.gen_1": {
    key: "culture.badge.gen_1",
    name: "Community Novice",
    emoji: "🏡",
    level: "I",
    rarity: "Common",
    description: "Welcome to the Fa Hui neighborhood community!",
    requirement: "Complete initial onboarding to Fahy.",
    color: "#F59E0B",
    ribbonColor: "#D97706",
    trackName: "Onboarding",
  },
  "culture.badge.gen_2": {
    key: "culture.badge.gen_2",
    name: "Active Resident",
    emoji: "🌱",
    level: "II",
    rarity: "Uncommon",
    description: "A friendly neighbor who actively participates in community events.",
    requirement: "Reach profile level 2 or higher.",
    color: "#F59E0B",
    ribbonColor: "#D97706",
    trackName: "Onboarding",
  },
  "culture.badge.gen_3": {
    key: "culture.badge.gen_3",
    name: "Heritage Guardian",
    emoji: "🎖️",
    level: "III",
    rarity: "Rare",
    description: "A pillar of the local community protecting cultural stories.",
    requirement: "Reach profile level 4 or higher.",
    color: "#F59E0B",
    ribbonColor: "#D97706",
    trackName: "Onboarding",
  },

  // Tea Art Track
  "culture.badge.gen_0": {
    key: "culture.badge.gen_0",
    name: "Tea Apprentice",
    emoji: "🍵",
    level: "I",
    rarity: "Common",
    description: "Beginner learning the way of Fa Hui local tea leaves.",
    requirement: "Visit & Scan Lin's Tea House.",
    color: "#10B981",
    ribbonColor: "#059669",
    trackName: "Tea Art",
  },
  "culture.badge.gen_11": {
    key: "culture.badge.gen_11",
    name: "Brewing Adept",
    emoji: "🍂",
    level: "II",
    rarity: "Uncommon",
    description: "Master of temperatures, steeping times, and clay pots.",
    requirement: "Unlock Tea Apprentice + Reach level 2 Profile.",
    color: "#10B981",
    ribbonColor: "#059669",
    trackName: "Tea Art",
  },
  "culture.badge.gen_12": {
    key: "culture.badge.gen_12",
    name: "Tea Grandmaster",
    emoji: "👑",
    level: "III",
    rarity: "Legendary",
    description: "An honored sommelier of traditional Chinese brewing arts.",
    requirement: "Unlock Brewing Adept + Reach level 4 Profile.",
    color: "#10B981",
    ribbonColor: "#059669",
    trackName: "Tea Art",
  },

  // Indigo Dye Track
  "culture.badge.gen_10": {
    key: "culture.badge.gen_10",
    name: "Indigo Starter",
    emoji: "👕",
    level: "I",
    rarity: "Common",
    description: "Your first deep immersion into organic plant fermentation dyes.",
    requirement: "Visit & Scan Old Town Indigo.",
    color: "#4F46E5",
    ribbonColor: "#3730A3",
    trackName: "Indigo Dye",
  },
  "culture.badge.gen_21": {
    key: "culture.badge.gen_21",
    name: "Indigo Artisan",
    emoji: "🌀",
    level: "II",
    rarity: "Uncommon",
    description: "Experienced dye practitioner crafting intricate tie-dye patterns.",
    requirement: "Unlock Indigo Starter + Reach level 2 Profile.",
    color: "#4F46E5",
    ribbonColor: "#3730A3",
    trackName: "Indigo Dye",
  },
  "culture.badge.gen_22": {
    key: "culture.badge.gen_22",
    name: "Master of Blue",
    emoji: "🔮",
    level: "III",
    rarity: "Legendary",
    description: "Preserving ancient deep-indigo shades through flawless craftsmanship.",
    requirement: "Unlock Indigo Artisan + Reach level 4 Profile.",
    color: "#4F46E5",
    ribbonColor: "#3730A3",
    trackName: "Indigo Dye",
  },

  // Bamboo Craft Track
  "culture.badge.gen_20": {
    key: "culture.badge.gen_20",
    name: "Weaving Pupil",
    emoji: "🎋",
    level: "I",
    rarity: "Common",
    description: "Learning the delicate split-bamboo techniques of the elders.",
    requirement: "Visit & Scan Bamboo & Co.",
    color: "#22C55E",
    ribbonColor: "#15803D",
    trackName: "Bamboo Craft",
  },
  "culture.badge.gen_31": {
    key: "culture.badge.gen_31",
    name: "Basket Crafter",
    emoji: "🧺",
    level: "II",
    rarity: "Uncommon",
    description: "Able to bind and form elegant 3D load-bearing utility baskets.",
    requirement: "Unlock Weaving Pupil + Reach level 2 Profile.",
    color: "#22C55E",
    ribbonColor: "#15803D",
    trackName: "Bamboo Craft",
  },
  "culture.badge.gen_32": {
    key: "culture.badge.gen_32",
    name: "Bamboo Sovereign",
    emoji: "🏰",
    level: "III",
    rarity: "Legendary",
    description: "Crafting architectural bamboo works and premium custom furniture.",
    requirement: "Unlock Basket Crafter + Reach level 4 Profile.",
    color: "#22C55E",
    ribbonColor: "#15803D",
    trackName: "Bamboo Craft",
  },

  // Paper Craft Track
  "culture.badge.gen_30": {
    key: "culture.badge.gen_30",
    name: "Paper Folder",
    emoji: "🪁",
    level: "I",
    rarity: "Common",
    description: "Learning bamboo-skeleton backing and fine paper folds.",
    requirement: "Visit & Scan Hui Paper Crafts.",
    color: "#EC4899",
    ribbonColor: "#BE185D",
    trackName: "Paper Craft",
  },
  "culture.badge.gen_41": {
    key: "culture.badge.gen_41",
    name: "Kite Designer",
    emoji: "🕊️",
    level: "II",
    rarity: "Uncommon",
    description: "Building fully flyable traditional wind kites.",
    requirement: "Unlock Paper Folder + Reach level 2 Profile.",
    color: "#EC4899",
    ribbonColor: "#BE185D",
    trackName: "Paper Craft",
  },
  "culture.badge.gen_42": {
    key: "culture.badge.gen_42",
    name: "Paper Sculptor",
    emoji: "🐉",
    level: "III",
    rarity: "Legendary",
    description: "Crafting complex multi-tiered paper dragons for festivals.",
    requirement: "Unlock Kite Designer + Reach level 4 Profile.",
    color: "#EC4899",
    ribbonColor: "#BE185D",
    trackName: "Paper Craft",
  },

  // Lantern Art Track
  "culture.badge.gen_70": {
    key: "culture.badge.gen_70",
    name: "Lantern Builder",
    emoji: "🏮",
    level: "I",
    rarity: "Common",
    description: "Hand-assembling standard celebratory festival lanterns.",
    requirement: "Visit & Scan Shing Kee Lanterns.",
    color: "#EF4444",
    ribbonColor: "#B91C1C",
    trackName: "Lantern Art",
  },
  "culture.badge.gen_71": {
    key: "culture.badge.gen_71",
    name: "Glow Artisan",
    emoji: "💡",
    level: "II",
    rarity: "Uncommon",
    description: "Integrating delicate illumination and calligraphic paintings.",
    requirement: "Unlock Lantern Builder + Reach level 2 Profile.",
    color: "#EF4444",
    ribbonColor: "#B91C1C",
    trackName: "Lantern Art",
  },
  "culture.badge.gen_72": {
    key: "culture.badge.gen_72",
    name: "Lantern Sovereign",
    emoji: "🎆",
    level: "III",
    rarity: "Legendary",
    description: "Acclaimed lantern designer lighting up city-wide celebrations.",
    requirement: "Unlock Glow Artisan + Reach level 4 Profile.",
    color: "#EF4444",
    ribbonColor: "#B91C1C",
    trackName: "Lantern Art",
  },
};

// Math-based SVG path calculations for unique, tactile borders matching the level
export const getBadgePath = (lvl: "I" | "II" | "III", cx = 50, cy = 50) => {
  let path = "";

  if (lvl === "I") {
    // 16 smooth, soft lobes for apprentice
    const points = 16;
    for (let i = 0; i <= points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? 46 : 41;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) {
        path += `M ${cx + 46} ${cy}`;
      } else {
        const midAngle = angle - Math.PI / (points * 2);
        const cxPt = cx + 49 * Math.cos(midAngle);
        const cyPt = cy + 49 * Math.sin(midAngle);
        path += ` Q ${cxPt.toFixed(1)} ${cyPt.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
  } else if (lvl === "II") {
    // 24 sharp, detailed scalloped petals for Journeyman/Adept
    const points = 24;
    for (let i = 0; i <= points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? 47 : 41;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) {
        path += `M ${cx + 47} ${cy}`;
      } else {
        const midAngle = angle - Math.PI / (points * 2);
        const cxPt = cx + 43 * Math.cos(midAngle);
        const cyPt = cy + 43 * Math.sin(midAngle);
        path += ` Q ${cxPt.toFixed(1)} ${cyPt.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
  } else {
    // Level III: 12 heavy, bold starburst sunrays for Master
    const points = 12;
    for (let i = 0; i <= points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? 48 : 36;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) {
        path += `M ${cx + 48} ${cy}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
  }
  path += " Z";
  return path;
};

export interface AchievementBadgeProps {
  badgeKey?: string;               // Key to lookup in the registry
  emoji?: string;                  // Fallback emoji
  color?: string;                  // Fallback primary color (hex)
  ribbonColor?: string;            // Fallback ribbon color (hex)
  level?: "I" | "II" | "III";      // Fallback level
  unlocked?: boolean;              // Is unlocked? (adds grayscale/lock overlay if false)
  equipped?: boolean;              // Is equipped? (adds premium pulsing gold border)
  size?: "xs" | "sm" | "md" | "lg"; // xs=w-8, sm=w-12, md=w-16, lg=w-20
  showRibbons?: boolean;           // Show ribbon tails hanging below (useful on larger rendering)
  showTooltip?: boolean;           // Show custom rich hover tooltip
  className?: string;              // Custom wrapper class
  onClick?: () => void;            // Custom click handler
  isOnboarding?: boolean;          // Suppress ribbons if used in onboarding intro card
}

export function AchievementBadge({
  badgeKey,
  emoji: overrideEmoji,
  color: overrideColor,
  ribbonColor: overrideRibbonColor,
  level: overrideLevel = "I",
  unlocked = true,
  equipped = false,
  size = "md",
  showRibbons = false,
  showTooltip = true,
  className,
  onClick,
  isOnboarding = false,
}: AchievementBadgeProps) {
  const [hovered, setHovered] = React.useState(false);

  // Lookup metadata from registry if key is provided
  const meta = badgeKey ? BADGES_REGISTRY[badgeKey] : null;
  const emoji = meta ? meta.emoji : (overrideEmoji || "🎖️");
  const color = meta ? meta.color : (overrideColor || "#F59E0B");
  const ribbonColor = meta ? meta.ribbonColor : (overrideRibbonColor || "#D97706");
  const level = meta ? meta.level : overrideLevel;
  const name = meta ? meta.name : (badgeKey ? badgeKey.split(".").pop() : "Honorary Badge");
  const description = meta ? meta.description : "An artisan achievement demonstrating dedication to Fa Hui cultural preservation.";
  const requirement = meta ? meta.requirement : "Acquired through community participation.";

  // Sizing definitions
  const sizeClasses = {
    xs: "w-8 h-8 text-sm",
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  // Adjust translation of emoji if Level III (due to top star in SVG)
  const isLvl3 = level === "III";
  const emojiTranslate = isLvl3
    ? size === "xs" ? "translate-y-0.5" : size === "sm" ? "translate-y-1" : "translate-y-1.5"
    : "translate-y-0";

  return (
    <div
      className={cn("relative flex flex-col items-center select-none", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ribbon tails underneath - rendered under the badge */}
      {showRibbons && !isOnboarding && (
        <div className="absolute -bottom-5 flex justify-center z-0 w-full pointer-events-none scale-90">
          {level === "I" && (
            <svg width="12" height="20" viewBox="0 0 14 24" className="transform origin-top">
              <path d="M0 0 L14 0 L14 24 L7 19 L0 24 Z" fill={unlocked ? ribbonColor : "#9CA3AF"} />
            </svg>
          )}

          {level === "II" && (
            <div className="flex gap-1.5 justify-center w-full">
              <svg width="12" height="22" viewBox="0 0 14 28" className="transform -rotate-12 origin-top">
                <path d="M0 0 L14 0 L14 28 L7 22 L0 28 Z" fill={unlocked ? ribbonColor : "#9CA3AF"} />
              </svg>
              <svg width="12" height="22" viewBox="0 0 14 28" className="transform rotate-12 origin-top">
                <path d="M0 0 L14 0 L14 28 L7 22 L0 28 Z" fill={unlocked ? ribbonColor : "#9CA3AF"} />
              </svg>
            </div>
          )}

          {level === "III" && (
            <div className="flex gap-1 justify-center w-full -mt-0.5">
              <svg width="10" height="24" viewBox="0 0 13 32" className="transform -rotate-20 origin-top opacity-85">
                <path d="M0 0 L13 0 L13 32 L6.5 25 L0 32 Z" fill={unlocked ? ribbonColor : "#9CA3AF"} />
              </svg>
              <svg width="13" height="28" viewBox="0 0 16 36" className="transform origin-top -mt-0.5">
                <path d="M0 0 L16 0 L16 36 L8 28 L0 36 Z" fill={unlocked ? "#FBBF24" : "#9CA3AF"} />
                <path d="M2 0 L14 0 L14 32 L8 26 L2 32 Z" fill={unlocked ? ribbonColor : "#78716C"} />
              </svg>
              <svg width="10" height="24" viewBox="0 0 13 32" className="transform rotate-20 origin-top opacity-85">
                <path d="M0 0 L13 0 L13 32 L6.5 25 L0 32 Z" fill={unlocked ? ribbonColor : "#9CA3AF"} />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Scalloped circle badge body */}
      <div
        onClick={onClick}
        className={cn(
          "rounded-full flex items-center justify-center relative z-10 cursor-pointer transform transition-all duration-300",
          sizeClasses[size],
          unlocked
            ? "ring-2 ring-white shadow-md hover:scale-110 hover:shadow-lg active:scale-95"
            : "opacity-40 filter grayscale cursor-not-allowed hover:scale-105"
        )}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <radialGradient id={`bgGrad-${badgeKey || 'custom'}-${level}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </radialGradient>
            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>

          {/* Scallop Base Path */}
          <path
            d={getBadgePath(level)}
            fill={unlocked ? (level === "III" ? "url(#goldRibbon)" : color) : "#6B7280"}
            className="drop-shadow-xs"
          />

          {/* Inner details based on Level */}
          {level === "I" && (
            <>
              <circle cx="50" cy="50" r="34" fill={unlocked ? "#FFFFFF" : "#4B5563"} className="opacity-95" />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={unlocked ? color : "#6B7280"}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </>
          )}

          {level === "II" && (
            <>
              <circle cx="50" cy="50" r="34" fill={unlocked ? "#FFFFFF" : "#4B5563"} className="opacity-95" />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill={unlocked ? `${color}15` : "none"}
                stroke={unlocked ? color : "#6B7280"}
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="26"
                fill="none"
                stroke={unlocked ? "#FBBF24" : "#9CA3AF"}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </>
          )}

          {level === "III" && (
            <>
              <circle cx="50" cy="50" r="35" fill={unlocked ? color : "#1F2937"} />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#FDE047"
                strokeWidth="2.5"
                strokeDasharray="2 3.5"
                className="animate-[spin_40s_linear_infinite]"
                style={{ transformOrigin: "50px 50px" }}
              />
              {unlocked && (
                <path
                  d="M 50 16 L 51.5 19 L 54.5 19 L 52.2 21 L 53 24 L 50 22 L 47 24 L 47.8 21 L 45.5 19 L 48.5 19 Z"
                  fill="#FDE047"
                  className="drop-shadow-2xs"
                />
              )}
            </>
          )}
        </svg>

        {/* Shiny glow layer */}
        <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-white/0 to-white/20 pointer-events-none z-20"></div>

        {/* Equipped golden ring */}
        {equipped && (
          <div className="absolute -inset-1 rounded-full border-2 border-fahy-yellow animate-pulse z-30 shadow-[0_0_8px_rgba(253,217,125,0.6)]"></div>
        )}

        {/* Core Emoji / Icon content */}
        <span className={cn("relative z-10", emojiTranslate)}>
          {emoji}
        </span>

        {/* Padlock overlay for locked state */}
        {!unlocked && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-10">
            <Lock className="w-3.5 h-3.5 text-white/90 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Premium Design System Tooltip */}
      {showTooltip && hovered && (
        <div className="absolute bottom-full mb-3 z-50 w-56 p-4 rounded-2xl bg-forest text-white shadow-xl border border-white/10 animate-fade-in text-left pointer-events-none">
          {/* Subtle triangle arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-forest" />
          
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-display font-bold text-sm tracking-tight leading-tight">
              {name}
            </span>
            <span className={cn(
              "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
              level === "III" ? "bg-fahy-yellow text-forest" : level === "II" ? "bg-sage-deep text-white" : "bg-white/15 text-white"
            )}>
              Lv. {level}
            </span>
          </div>
          
          {meta && (
            <p className="text-[9px] font-bold text-fahy-yellow uppercase tracking-widest mb-2 font-display">
              {meta.trackName} · {meta.rarity}
            </p>
          )}

          <p className="text-[11px] text-white/80 leading-relaxed mb-2.5">
            {description}
          </p>

          <div className="border-t border-white/10 pt-2 flex flex-col gap-1">
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
              Requirement
            </p>
            <p className="text-[10px] text-peach font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-peach flex-shrink-0" />
              <span>{requirement}</span>
            </p>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold">
            <span className={cn(
              "flex items-center gap-1",
              unlocked ? "text-sage" : "text-white/30"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", unlocked ? "bg-sage-deep animate-ping" : "bg-white/20")} />
              {unlocked ? "Unlocked" : "Locked"}
            </span>
            {equipped && (
              <span className="text-fahy-yellow flex items-center gap-1">
                <Award className="w-3 h-3 fill-fahy-yellow" /> Equipped
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
