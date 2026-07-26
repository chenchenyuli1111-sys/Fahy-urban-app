import React from "react";

interface AccessoryProps {
  scale?: number;
  className?: string;
}

/* ==================== HEAD ACCESSORIES ==================== */

export function StrawHatAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 100 * scale,
        height: 50 * scale,
      }}
    >
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Crown dome */}
        <path
          d="M22 30 C22 10, 78 10, 78 30 Z"
          fill="#E6C280"
          stroke="#B89047"
          strokeWidth="1.5"
        />
        {/* Weave texture */}
        <path
          d="M30 18 Q50 22, 70 18"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeDasharray="3 2"
          fill="none"
        />
        <path
          d="M25 24 Q50 28, 75 24"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeDasharray="3 2"
          fill="none"
        />
        {/* Ribbon */}
        <rect x="21" y="27" width="58" height="5" fill="#10B981" rx="1.5" />
        {/* Flower pin */}
        <circle cx="32" cy="28" r="4" fill="#F43F5E" />
        <circle cx="32" cy="28" r="1.5" fill="#FBBF24" />
        {/* Wide Brim */}
        <path
          d="M5 32 Q50 42, 95 32 Q50 26, 5 32"
          fill="#D4B06A"
          stroke="#9A7730"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function JadeCrownAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-lg ${className}`}
      style={{
        width: 70 * scale,
        height: 55 * scale,
      }}
    >
      <svg viewBox="0 0 70 55" className="w-full h-full">
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="jadeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Crown body */}
        <path
          d="M10 45 L10 20 L22 32 L35 12 L48 32 L60 20 L60 45 Z"
          fill="url(#goldGrad)"
          stroke="#854D0E"
          strokeWidth="1.5"
        />
        {/* Base Rim */}
        <rect x="8" y="42" width="54" height="6" fill="#059669" rx="2" />
        <rect
          x="10"
          y="43"
          width="50"
          height="4"
          fill="url(#jadeGrad)"
          rx="1"
        />
        {/* Jewels */}
        <polygon
          points="35,16 39,22 35,28 31,22"
          fill="#EF4444"
          stroke="#B91C1C"
          strokeWidth="0.8"
        />
        <circle cx="10" cy="20" r="3.5" fill="url(#jadeGrad)" />
        <circle cx="60" cy="20" r="3.5" fill="url(#jadeGrad)" />
        <circle cx="22" cy="32" r="2.5" fill="#3B82F6" />
        <circle cx="48" cy="32" r="2.5" fill="#3B82F6" />
      </svg>
    </div>
  );
}

export function CamelliaCrownAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 80 * scale,
        height: 40 * scale,
      }}
    >
      <svg viewBox="0 0 80 40" className="w-full h-full">
        {/* Vine base */}
        <path
          d="M10 25 Q40 32, 70 25"
          stroke="#047857"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Leaves */}
        <path d="M18 24 Q24 16, 28 22 Q22 28, 18 24" fill="#10B981" />
        <path d="M52 22 Q58 16, 62 24 Q56 28, 52 22" fill="#10B981" />
        {/* Center Camellia Blossom */}
        <g transform="translate(40,20)">
          <circle cx="0" cy="0" r="10" fill="#FB7185" />
          <circle cx="-3" cy="-3" r="6" fill="#FDA4AF" />
          <circle cx="3" cy="3" r="5" fill="#F43F5E" />
          <circle cx="0" cy="0" r="3" fill="#FBBF24" />
        </g>
        {/* Side Camellias */}
        <g transform="translate(20,24)">
          <circle cx="0" cy="0" r="7" fill="#FB7185" />
          <circle cx="0" cy="0" r="2" fill="#FBBF24" />
        </g>
        <g transform="translate(60,24)">
          <circle cx="0" cy="0" r="7" fill="#FB7185" />
          <circle cx="0" cy="0" r="2" fill="#FBBF24" />
        </g>
      </svg>
    </div>
  );
}

export function LionHeadAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-xl ${className}`}
      style={{
        width: 90 * scale,
        height: 70 * scale,
      }}
    >
      <svg viewBox="0 0 90 70" className="w-full h-full">
        {/* Fur Mane background */}
        <path
          d="M10 50 Q20 10, 45 10 Q70 10, 80 50 Q45 65, 10 50"
          fill="#EF4444"
        />
        {/* Fur tufts */}
        <circle cx="18" cy="22" r="12" fill="#F59E0B" />
        <circle cx="72" cy="22" r="12" fill="#F59E0B" />
        <circle cx="45" cy="12" r="14" fill="#FBBF24" />
        {/* Mirror orb on forehead */}
        <circle
          cx="45"
          cy="22"
          r="7"
          fill="#3B82F6"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Big Lion Eyes */}
        <circle
          cx="30"
          cy="36"
          r="11"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <circle cx="30" cy="36" r="6" fill="#000000" />
        <circle cx="28" cy="34" r="2" fill="#FFFFFF" />

        <circle
          cx="60"
          cy="36"
          r="11"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <circle cx="60" cy="36" r="6" fill="#000000" />
        <circle cx="58" cy="34" r="2" fill="#FFFFFF" />

        {/* Snout & Mouth */}
        <ellipse cx="45" cy="48" rx="14" ry="10" fill="#10B981" />
        <circle cx="45" cy="44" r="4" fill="#DC2626" />
      </svg>
    </div>
  );
}

export function DimSumBasketAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 80 * scale,
        height: 50 * scale,
      }}
    >
      <svg viewBox="0 0 80 50" className="w-full h-full">
        {/* Steamer lid handle */}
        <rect x="36" y="8" width="8" height="6" fill="#885B28" rx="2" />
        {/* Bamboo Lid */}
        <path
          d="M15 30 Q40 10, 65 30 Z"
          fill="#D4A359"
          stroke="#885B28"
          strokeWidth="2"
        />
        {/* Basket weaves */}
        <path
          d="M22 24 Q40 16, 58 24"
          stroke="#885B28"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Steamer Basket Body */}
        <rect
          x="12"
          y="28"
          width="56"
          height="14"
          fill="#B8860B"
          rx="3"
          stroke="#5C4010"
          strokeWidth="1.5"
        />
        {/* Steamed Bao inside peek */}
        <circle cx="30" cy="28" r="6" fill="#FFFBEB" />
        <circle cx="50" cy="28" r="6" fill="#FFFBEB" />
      </svg>
    </div>
  );
}

/* ==================== FACE ACCESSORIES ==================== */

export function SunglassesAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 75 * scale,
        height: 30 * scale,
      }}
    >
      <svg viewBox="0 0 75 30" className="w-full h-full">
        {/* Frame Bridge */}
        <rect x="32" y="10" width="11" height="3" fill="#D4AF37" />
        {/* Left Lens */}
        <path
          d="M8 8 L32 8 L30 24 L12 24 Z"
          fill="#1E1B4B"
          stroke="#D4AF37"
          strokeWidth="1.5"
        />
        {/* Right Lens */}
        <path
          d="M43 8 L67 8 L63 24 L45 24 Z"
          fill="#1E1B4B"
          stroke="#D4AF37"
          strokeWidth="1.5"
        />
        {/* Reflection sheen */}
        <path d="M12 10 L22 10 L16 20 L10 20 Z" fill="#818CF8" opacity="0.6" />
        <path d="M47 10 L57 10 L51 20 L45 20 Z" fill="#818CF8" opacity="0.6" />
      </svg>
    </div>
  );
}

export function BlushAccessory({ scale = 1, className = "" }: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none flex justify-between items-center ${className}`}
      style={{
        width: 70 * scale,
        height: 20 * scale,
      }}
    >
      <div className="w-5 h-3 bg-pink-400/60 rounded-full blur-[1px] animate-pulse" />
      <div className="w-5 h-3 bg-pink-400/60 rounded-full blur-[1px] animate-pulse" />
    </div>
  );
}

export function MonocleAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-sm ${className}`}
      style={{
        width: 45 * scale,
        height: 40 * scale,
      }}
    >
      <svg viewBox="0 0 45 40" className="w-full h-full">
        {/* Monocle Lens */}
        <circle
          cx="18"
          cy="16"
          r="11"
          fill="#6EE7B7"
          fillOpacity="0.25"
          stroke="#D4AF37"
          strokeWidth="2.5"
        />
        {/* Chain */}
        <path
          d="M28 20 Q38 32, 42 40"
          stroke="#D4AF37"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
}

/* ==================== BODY ACCESSORIES ==================== */

export function IndigoScarfAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 85 * scale,
        height: 40 * scale,
      }}
    >
      <svg viewBox="0 0 85 40" className="w-full h-full">
        {/* Main scarf loop around neck */}
        <path
          d="M12 12 Q42.5 28, 73 12 Q42.5 2, 12 12"
          fill="#1E3A8A"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        {/* White tie-dye pattern */}
        <circle cx="32" cy="14" r="3" fill="#FFFFFF" opacity="0.8" />
        <circle cx="52" cy="14" r="3" fill="#FFFFFF" opacity="0.8" />
        {/* Dangling scarf tail */}
        <path
          d="M50 18 Q55 35, 62 38 L72 35 Q65 18, 58 16 Z"
          fill="#1E40AF"
          stroke="#2563EB"
          strokeWidth="1"
        />
        {/* Fringe */}
        <line
          x1="62"
          y1="38"
          x2="63"
          y2="42"
          stroke="#60A5FA"
          strokeWidth="1.5"
        />
        <line
          x1="66"
          y1="37"
          x2="68"
          y2="41"
          stroke="#60A5FA"
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="36"
          x2="73"
          y2="40"
          stroke="#60A5FA"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function TangSuitAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-lg ${className}`}
      style={{
        width: 90 * scale,
        height: 50 * scale,
      }}
    >
      <svg viewBox="0 0 90 50" className="w-full h-full">
        {/* Vest Collar & Front */}
        <path
          d="M20 5 L45 18 L70 5 L80 45 L10 45 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1.5"
        />
        {/* Gold Border Trim */}
        <path
          d="M20 5 L45 18 L70 5"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="3"
        />
        <line
          x1="45"
          y1="18"
          x2="45"
          y2="45"
          stroke="#FBBF24"
          strokeWidth="2.5"
        />
        {/* Traditional Knot Buttons */}
        <circle cx="45" cy="24" r="3" fill="#F59E0B" />
        <circle cx="45" cy="32" r="3" fill="#F59E0B" />
        <circle cx="45" cy="40" r="3" fill="#F59E0B" />
      </svg>
    </div>
  );
}

export function RoyalCapeAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-xl ${className}`}
      style={{
        width: 110 * scale,
        height: 75 * scale,
      }}
    >
      <svg viewBox="0 0 110 75" className="w-full h-full">
        {/* Flowing Back Cape Wings */}
        <path
          d="M25 15 Q5 45, 10 70 Q55 60, 100 70 Q105 45, 85 15 Z"
          fill="#047857"
          stroke="#065F46"
          strokeWidth="2"
        />
        {/* Gold Brooch Brocade */}
        <path
          d="M35 15 Q55 22, 75 15"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="3"
        />
        <circle
          cx="55"
          cy="18"
          r="6"
          fill="#EF4444"
          stroke="#FBBF24"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* ==================== HAND ACCESSORIES ==================== */

export function WateringCanAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-lg ${className}`}
      style={{
        width: 60 * scale,
        height: 55 * scale,
      }}
    >
      <svg viewBox="0 0 60 55" className="w-full h-full">
        {/* Can Body */}
        <rect
          x="18"
          y="22"
          width="26"
          height="24"
          fill="#FBBF24"
          rx="4"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        {/* Handle */}
        <path
          d="M18 26 Q8 26, 8 36 Q8 44, 18 44"
          fill="none"
          stroke="#D97706"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Spout */}
        <path
          d="M44 32 L56 20"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Rose Head */}
        <circle cx="56" cy="20" r="4.5" fill="#F59E0B" />
        {/* Animated Water Droplets */}
        <g className="animate-bounce">
          <circle cx="58" cy="28" r="1.5" fill="#3B82F6" />
          <circle cx="55" cy="34" r="2" fill="#60A5FA" />
          <circle cx="59" cy="40" r="1.5" fill="#93C5FD" />
        </g>
      </svg>
    </div>
  );
}

export function SpadeAccessory({ scale = 1, className = "" }: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 45 * scale,
        height: 60 * scale,
      }}
    >
      <svg viewBox="0 0 45 60" className="w-full h-full">
        {/* Wooden Handle */}
        <rect x="20" y="30" width="5" height="26" fill="#885B28" rx="2" />
        {/* Handle Grip */}
        <path d="M16 54 H29 V58 H16 Z" fill="#5C4010" rx="1" />
        {/* Metal Blade */}
        <path
          d="M12 30 Q22.5 10, 33 30 Z"
          fill="#9CA3AF"
          stroke="#4B5563"
          strokeWidth="1.5"
        />
        {/* Soil clump */}
        <circle cx="22" cy="26" r="3" fill="#78350F" />
      </svg>
    </div>
  );
}

export function TeaCupAccessory({ scale = 1, className = "" }: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 50 * scale,
        height: 50 * scale,
      }}
    >
      <svg viewBox="0 0 50 50" className="w-full h-full">
        {/* Steam rising */}
        <path
          d="M20 12 Q23 6, 20 2"
          stroke="#93C5FD"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
          className="animate-pulse"
        />
        <path
          d="M30 14 Q33 8, 30 4"
          stroke="#93C5FD"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
          className="animate-pulse"
        />
        {/* Porcelain Cup */}
        <path
          d="M12 18 H38 V34 Q38 42, 25 42 Q12 42, 12 34 Z"
          fill="#FFFFFF"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
        {/* Blue Willow motif */}
        <path
          d="M16 26 Q25 32, 34 26"
          stroke="#0284C7"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tea Liquid */}
        <ellipse cx="25" cy="19" rx="12" ry="2" fill="#D97706" />
      </svg>
    </div>
  );
}

export function LanternAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-xl ${className}`}
      style={{
        width: 55 * scale,
        height: 70 * scale,
      }}
    >
      <svg viewBox="0 0 55 70" className="w-full h-full">
        {/* Pole/String */}
        <line x1="27" y1="2" x2="27" y2="16" stroke="#D4AF37" strokeWidth="2" />
        {/* Top Gold Cap */}
        <rect x="20" y="16" width="14" height="4" fill="#D4AF37" rx="1" />
        {/* Lantern Oval Silk Body */}
        <ellipse
          cx="27"
          cy="38"
          rx="18"
          ry="18"
          fill="#EF4444"
          stroke="#B91C1C"
          strokeWidth="1.5"
        />
        {/* Inner Glow */}
        <circle
          cx="27"
          cy="38"
          r="10"
          fill="#FBBF24"
          opacity="0.8"
          className="animate-pulse"
        />
        {/* Bamboo Rib lines */}
        <path
          d="M27 20 C18 28, 18 48, 27 56"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="1"
        />
        <path
          d="M27 20 C36 28, 36 48, 27 56"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="1"
        />
        {/* Bottom Cap */}
        <rect x="20" y="56" width="14" height="4" fill="#D4AF37" rx="1" />
        {/* Tassel */}
        <line
          x1="27"
          y1="60"
          x2="27"
          y2="68"
          stroke="#EF4444"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

export function PeachBlossomAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 60 * scale,
        height: 65 * scale,
      }}
    >
      <svg viewBox="0 0 60 65" className="w-full h-full">
        {/* Branch */}
        <path
          d="M10 58 Q30 40, 50 10"
          stroke="#78350F"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Blossoms */}
        <circle cx="45" cy="15" r="7" fill="#F472B6" />
        <circle cx="45" cy="15" r="2" fill="#FBBF24" />

        <circle cx="32" cy="30" r="6" fill="#FB7185" />
        <circle cx="32" cy="30" r="2" fill="#FBBF24" />

        <circle cx="20" cy="45" r="5" fill="#FDA4AF" />
      </svg>
    </div>
  );
}

export function CalligraphyBrushAccessory({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-lg ${className}`}
      style={{
        width: 45 * scale,
        height: 65 * scale,
      }}
    >
      <svg viewBox="0 0 45 65" className="w-full h-full">
        {/* Bamboo Shaft */}
        <rect x="20" y="8" width="5" height="42" fill="#15803D" rx="2" />
        <line
          x1="20"
          y1="22"
          x2="25"
          y2="22"
          stroke="#166534"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="36"
          x2="25"
          y2="36"
          stroke="#166534"
          strokeWidth="1.5"
        />
        {/* Ferrule */}
        <rect x="19" y="48" width="7" height="4" fill="#D4AF37" />
        {/* Hair Tip */}
        <path d="M19 52 Q22.5 65, 26 52 Z" fill="#1E293B" />
      </svg>
    </div>
  );
}

/* ==================== COMPANION ACCESSORIES ==================== */

export function BabySproutCompanion({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md animate-bounce ${className}`}
      style={{
        width: 45 * scale,
        height: 45 * scale,
      }}
    >
      <svg viewBox="0 0 45 45" className="w-full h-full">
        <circle cx="22.5" cy="28" r="10" fill="#34D399" />
        <circle cx="19" cy="26" r="1.5" fill="#000000" />
        <circle cx="26" cy="26" r="1.5" fill="#000000" />
        <path
          d="M21 29 Q22.5 31, 24 29"
          stroke="#000000"
          strokeWidth="1"
          fill="none"
        />
        {/* Twin Sprout Leaves */}
        <path d="M22.5 18 Q12 10, 16 20 Z" fill="#10B981" />
        <path d="M22.5 18 Q33 10, 29 20 Z" fill="#10B981" />
      </svg>
    </div>
  );
}

export function ButterflyCompanion({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-lg animate-pulse ${className}`}
      style={{
        width: 50 * scale,
        height: 50 * scale,
      }}
    >
      <svg viewBox="0 0 50 50" className="w-full h-full">
        {/* Left Wings */}
        <path
          d="M25 25 Q5 5, 8 25 Q12 38, 25 28"
          fill="#38BDF8"
          stroke="#0284C7"
          strokeWidth="1"
        />
        {/* Right Wings */}
        <path
          d="M25 25 Q45 5, 42 25 Q38 38, 25 28"
          fill="#38BDF8"
          stroke="#0284C7"
          strokeWidth="1"
        />
        {/* Body */}
        <line
          x1="25"
          y1="18"
          x2="25"
          y2="32"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function GoldfishCompanion({
  scale = 1,
  className = "",
}: AccessoryProps) {
  return (
    <div
      className={`pointer-events-none filter drop-shadow-md ${className}`}
      style={{
        width: 55 * scale,
        height: 45 * scale,
      }}
    >
      <svg viewBox="0 0 55 45" className="w-full h-full">
        {/* Flowing Tail */}
        <path
          d="M18 22 Q2 10, 5 22 Q2 34, 18 22"
          fill="#F97316"
          opacity="0.9"
        />
        {/* Fish Body */}
        <ellipse cx="32" cy="22" rx="14" ry="10" fill="#EA580C" />
        {/* Big Koi Eye */}
        <circle cx="40" cy="19" r="3" fill="#FFFFFF" />
        <circle cx="41" cy="19" r="1.5" fill="#000000" />
      </svg>
    </div>
  );
}

/**
 * Main accessory dispatcher that renders the custom tailor-made SVG component
 */
export function AccessoryItem({
  slot,
  itemId,
  scale = 1,
  className = "",
}: {
  slot: "head" | "face" | "body" | "hand" | "companion";
  itemId?: string;
  scale?: number;
  className?: string;
}) {
  if (!itemId || itemId === "none") return null;

  switch (slot) {
    case "head":
      if (itemId === "straw_hat")
        return <StrawHatAccessory scale={scale} className={className} />;
      if (itemId === "crown")
        return <JadeCrownAccessory scale={scale} className={className} />;
      if (itemId === "camellia_crown")
        return <CamelliaCrownAccessory scale={scale} className={className} />;
      if (itemId === "lion_head")
        return <LionHeadAccessory scale={scale} className={className} />;
      if (itemId === "dimsum_basket")
        return <DimSumBasketAccessory scale={scale} className={className} />;
      break;

    case "face":
      if (itemId === "shades")
        return <SunglassesAccessory scale={scale} className={className} />;
      if (itemId === "blush")
        return <BlushAccessory scale={scale} className={className} />;
      if (itemId === "monocle")
        return <MonocleAccessory scale={scale} className={className} />;
      break;

    case "body":
      if (itemId === "indigo_scarf")
        return <IndigoScarfAccessory scale={scale} className={className} />;
      if (itemId === "tang_suit")
        return <TangSuitAccessory scale={scale} className={className} />;
      if (itemId === "royal_cape")
        return <RoyalCapeAccessory scale={scale} className={className} />;
      break;

    case "hand":
      if (itemId === "watering_can")
        return <WateringCanAccessory scale={scale} className={className} />;
      if (itemId === "spade")
        return <SpadeAccessory scale={scale} className={className} />;
      if (itemId === "tea_cup")
        return <TeaCupAccessory scale={scale} className={className} />;
      if (itemId === "lantern")
        return <LanternAccessory scale={scale} className={className} />;
      if (itemId === "peach_blossom")
        return <PeachBlossomAccessory scale={scale} className={className} />;
      if (itemId === "calligraphy_brush")
        return (
          <CalligraphyBrushAccessory scale={scale} className={className} />
        );
      break;

    case "companion":
      if (itemId === "baby_sprout")
        return <BabySproutCompanion scale={scale} className={className} />;
      if (itemId === "butterfly_pal")
        return <ButterflyCompanion scale={scale} className={className} />;
      if (itemId === "goldfish_pal")
        return <GoldfishCompanion scale={scale} className={className} />;
      break;
  }

  return null;
}
