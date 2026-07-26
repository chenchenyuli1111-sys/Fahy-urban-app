import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { PixelFahy, FahyEvolution, getEvolutionForLevel } from "./PixelFahy";
import { EVOLUTION_SPECS } from "./fahyEvolutionConfig";
import { AccessoryItem } from "./MascotAccessories";
import { FahyThreeCanvas } from "./FahyThreeCanvas";
import {
  Sparkles,
  RotateCw,
  Shirt,
  Check,
  ShieldCheck,
  Ruler,
} from "lucide-react";
import { gameSounds } from "@/lib/sounds";
import { useDailyQuests } from "@/lib/DailyQuestContext";

interface Fahy3DMascotProps {
  level?: number;
  evolution?: FahyEvolution;
  equipped?: {
    head?: string;
    face?: string;
    body?: string;
    hand?: string;
    companion?: string;
    background?: string;
  };
  size?: number;
  interactive3D?: boolean;
  showDressUpBar?: boolean;
  onEquipChange?: (slot: string, itemId: string) => void;
  unlockedItems?: string[];
  className?: string;
}

export function Fahy3DMascot({
  level = 10,
  evolution,
  equipped = {},
  size = 200,
  interactive3D = true,
  showDressUpBar = false,
  onEquipChange,
  className = "",
}: Fahy3DMascotProps) {
  const { updateQuestProgress } = useDailyQuests();
  const currentEvo =
    evolution || (level ? getEvolutionForLevel(level) : "sprout");
  const spec = EVOLUTION_SPECS[currentEvo] || EVOLUTION_SPECS.sprout;

  // 3D rotation state
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(-10);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "head" | "face" | "body" | "hand" | "companion"
  >("head");

  const dragStartRef = useRef<{
    x: number;
    y: number;
    rotY: number;
    rotX: number;
  }>({
    x: 0,
    y: 0,
    rotY: 0,
    rotX: -10,
  });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactive3D) return;
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY, rotY, rotX };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !interactive3D) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    setRotY(dragStartRef.current.rotY + deltaX * 0.8);
    setRotX(
      Math.max(-30, Math.min(20, dragStartRef.current.rotX - deltaY * 0.4)),
    );
  };

  const handleMouseUp = () => {
    if (isDragging) {
      updateQuestProgress("quest_orbit_3d");
    }
    setIsDragging(false);
  };

  const reset3DRotation = () => {
    setRotY(0);
    setRotX(-10);
    gameSounds.play("click");
  };

  // Quick dress-up options
  const DRESS_UP_OPTIONS: Record<string, { id: string; name: string }[]> = {
    head: [
      { id: "none", name: "None" },
      { id: "straw_hat", name: "Straw Hat" },
      { id: "crown", name: "Jade Crown" },
      { id: "camellia_crown", name: "Camellia Tiara" },
      { id: "lion_head", name: "Lion Head" },
      { id: "dimsum_basket", name: "Dim Sum Steamer" },
    ],
    face: [
      { id: "none", name: "None" },
      { id: "shades", name: "Cyber Sunglasses" },
      { id: "blush", name: "Anime Blush" },
      { id: "monocle", name: "Gold Monocle" },
    ],
    body: [
      { id: "none", name: "None" },
      { id: "indigo_scarf", name: "Indigo Scarf" },
      { id: "tang_suit", name: "Tang Vest" },
      { id: "royal_cape", name: "Emerald Cape" },
    ],
    hand: [
      { id: "none", name: "None" },
      { id: "watering_can", name: "Golden Can" },
      { id: "spade", name: "Garden Spade" },
      { id: "tea_cup", name: "Herbal Tea" },
      { id: "lantern", name: "Silk Lantern" },
      { id: "peach_blossom", name: "Peach Branch" },
      { id: "calligraphy_brush", name: "Ink Brush" },
    ],
    companion: [
      { id: "none", name: "None" },
      { id: "baby_sprout", name: "Baby Sprout" },
      { id: "butterfly_pal", name: "Jade Butterfly" },
      { id: "goldfish_pal", name: "Koi Goldfish" },
    ],
  };

  // Calculate dynamic scale factor for accessories based on evolution size
  const evoScale = spec.baseScale;
  const anchors = spec.anchors;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Evolution Stature Header Badge */}
      <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-forest/10 border border-forest/20 rounded-full text-xs font-bold text-forest shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>{spec.name}</span>
        <span className="text-forest/40">•</span>
        <span className="flex items-center gap-1 text-[11px] text-forest/70">
          <Ruler className="w-3 h-3 text-emerald-600" />
          {spec.heightCm}cm ({Math.round(spec.baseScale * 100)}% Size)
        </span>
      </div>

      {/* 3D Stage Viewport */}
      <div
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        style={{
          width: size * 1.4,
          height: size * 1.5,
          perspective: 1000,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background WebGL Three.js 3D Pedestal Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <FahyThreeCanvas
            evolution={currentEvo}
            size={size}
            rotY={rotY}
            rotX={rotX}
            isDragging={isDragging}
          />
        </div>

        {/* 3D Rotatable Stage Platform for Character & Custom Accessories */}
        <div
          className="relative z-10 flex items-center justify-center transition-transform duration-75"
          style={{
            width: size * evoScale,
            height: size * evoScale,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Character Body & Layered Accessories */}
          <motion.div
            animate={{
              y: isDragging ? 0 : [0, -6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex items-center justify-center pointer-events-none"
            style={{
              width: size * evoScale,
              height: size * evoScale,
              transformStyle: "preserve-3d",
            }}
          >
            {/* 1. Base Mascot (Transparent High-Res PNG) */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <PixelFahy
                evolution={currentEvo}
                size={size * evoScale}
                interactive={false}
                className="w-full h-full filter drop-shadow-xl"
              />
            </div>

            {/* 2. TAILOR-MADE HEAD ACCESSORY (Dynamically positioned & scaled per evolution stage) */}
            {equipped.head && equipped.head !== "none" && (
              <div
                className="absolute pointer-events-none z-30 transition-all duration-300"
                style={{
                  top: anchors.head.top,
                  left: anchors.head.left,
                  transform: `translate(-50%, -50%) translateZ(35px) rotate(${anchors.head.rotation || 0}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <AccessoryItem
                  slot="head"
                  itemId={equipped.head}
                  scale={anchors.head.scale * evoScale * (size / 200)}
                />
              </div>
            )}

            {/* 3. TAILOR-MADE FACE ACCESSORY */}
            {equipped.face && equipped.face !== "none" && (
              <div
                className="absolute pointer-events-none z-30 transition-all duration-300"
                style={{
                  top: anchors.face.top,
                  left: anchors.face.left,
                  transform: `translate(-50%, -50%) translateZ(28px) rotate(${anchors.face.rotation || 0}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <AccessoryItem
                  slot="face"
                  itemId={equipped.face}
                  scale={anchors.face.scale * evoScale * (size / 200)}
                />
              </div>
            )}

            {/* 4. TAILOR-MADE BODY ACCESSORY */}
            {equipped.body && equipped.body !== "none" && (
              <div
                className="absolute pointer-events-none z-20 transition-all duration-300"
                style={{
                  top: anchors.body.top,
                  left: anchors.body.left,
                  transform: `translate(-50%, -50%) translateZ(20px) rotate(${anchors.body.rotation || 0}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <AccessoryItem
                  slot="body"
                  itemId={equipped.body}
                  scale={anchors.body.scale * evoScale * (size / 200)}
                />
              </div>
            )}

            {/* 5. TAILOR-MADE HAND ACCESSORY */}
            {equipped.hand && equipped.hand !== "none" && (
              <div
                className="absolute pointer-events-none z-30 transition-all duration-300"
                style={{
                  top: anchors.hand.top,
                  left: anchors.hand.left,
                  transform: `translate(-50%, -50%) translateZ(32px) rotate(${anchors.hand.rotation || 0}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <AccessoryItem
                  slot="hand"
                  itemId={equipped.hand}
                  scale={anchors.hand.scale * evoScale * (size / 200)}
                />
              </div>
            )}

            {/* 6. TAILOR-MADE FLOATING COMPANION */}
            {equipped.companion && equipped.companion !== "none" && (
              <div
                className="absolute pointer-events-none z-40 transition-all duration-300"
                style={{
                  top: anchors.companion.top,
                  left: anchors.companion.left,
                  transform: `translate(-50%, -50%) translateZ(40px) rotate(${anchors.companion.rotation || 0}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <AccessoryItem
                  slot="companion"
                  itemId={equipped.companion}
                  scale={anchors.companion.scale * evoScale * (size / 200)}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* 3D Orbit Reset Button */}
        {interactive3D && (
          <button
            type="button"
            onClick={reset3DRotation}
            className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white text-forest rounded-full shadow-md border border-black/10 text-xs flex items-center gap-1 font-bold active:scale-90 transition-transform cursor-pointer z-30"
            title="Reset 3D View"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-600" /> Spin 360°
          </button>
        )}
      </div>

      {/* Dress Up Wardrobe Bar */}
      {showDressUpBar && (
        <div className="w-full max-w-md mt-4 bg-surface/95 backdrop-blur-md rounded-2xl border border-black/10 p-3 shadow-md">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-forest uppercase tracking-wider">
              <Shirt className="w-4 h-4 text-emerald-600" />
              Tailor-Made 3D Wardrobe
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Auto-Scaling Enabled
            </span>
          </div>

          {/* Slot Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
            {(["head", "face", "body", "hand", "companion"] as const).map(
              (slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setActiveTab(slot);
                    gameSounds.play("click");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === slot
                      ? "bg-forest text-fahy-yellow shadow-xs scale-105"
                      : "bg-black/5 text-forest/70 hover:bg-black/10"
                  }`}
                >
                  {slot === "head" && "👒 Head"}
                  {slot === "face" && "🕶️ Face"}
                  {slot === "body" && "🥋 Body"}
                  {slot === "hand" && "🚰 Hand"}
                  {slot === "companion" && "🦋 Pal"}
                </button>
              ),
            )}
          </div>

          {/* Item Selector Grid with Tailor-Made Vector Previews */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
            {DRESS_UP_OPTIONS[activeTab]?.map((item) => {
              const isEquipped =
                (equipped[activeTab] || "none") === item.id ||
                (!equipped[activeTab] && item.id === "none");

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onEquipChange) {
                      onEquipChange(
                        activeTab,
                        item.id === "none" ? "" : item.id,
                      );
                      gameSounds.play("sparkle");
                      if (item.id !== "none") {
                        updateQuestProgress("quest_dressup_3d");
                      }
                    }
                  }}
                  className={`relative p-2 rounded-xl border text-center flex flex-col items-center justify-between min-h-[72px] transition-all cursor-pointer ${
                    isEquipped
                      ? "border-emerald-500 bg-emerald-50/90 shadow-xs ring-2 ring-emerald-400/50"
                      : "border-black/10 bg-white/80 hover:bg-white hover:border-black/20"
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center my-1">
                    {item.id === "none" ? (
                      <span className="text-xl text-gray-400">🚫</span>
                    ) : (
                      <AccessoryItem
                        slot={activeTab}
                        itemId={item.id}
                        scale={0.55}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-forest leading-tight line-clamp-1 w-full text-center">
                    {item.name}
                  </span>
                  {isEquipped && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
