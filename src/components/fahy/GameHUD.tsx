import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "@/lib/AppState";
import { useAuth } from "@/lib/AuthContext";
import { gameSounds } from "@/lib/sounds";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Coins,
  Star,
  Trophy,
  Award,
  Check,
} from "lucide-react";

export function GameHUD() {
  const { user } = useAuth();
  const { coins, xp, level, points } = useAppState();
  const [muted, setMuted] = useState(gameSounds.getMute());
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinGlow, setCoinGlow] = useState(false);

  // Level up overlay trigger
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  // Keep mute state in sync with local state
  useEffect(() => {
    setMuted(gameSounds.getMute());
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = gameSounds.toggleMute();
    setMuted(isNowMuted);
  };

  // Detect Coin increases for juicy bounce animations
  useEffect(() => {
    if (coins > prevCoins) {
      setCoinGlow(true);
      gameSounds.play("coin");
      const t = setTimeout(() => setCoinGlow(false), 800);
      setPrevCoins(coins);
      return () => clearTimeout(t);
    }
    setPrevCoins(coins);
  }, [coins]);

  // Detect Level Up increments
  useEffect(() => {
    if (!user) {
      prevLevelRef.current = null;
      return;
    }

    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      // Trigger LEVEL UP celebration!
      setShowLevelUp(true);
      gameSounds.play("levelUp");
    }

    prevLevelRef.current = level;
  }, [level, user]);

  if (!user) return null;

  // Calculate percentage of level completion
  const xpInLevel = xp % 100;

  return (
    <div className="w-full relative z-40 bg-linear-to-b from-emerald-950/5 to-transparent border-b border-black/[0.03] px-4 py-2 flex items-center justify-between gap-3 select-none">
      {/* LEVEL & XP STATUS BOARD */}
      <div className="flex items-center gap-2 flex-1 max-w-[200px]">
        <div className="relative">
          <div className="w-10 h-10 bg-forest rounded-xl border-2 border-fahy-yellow/40 flex flex-col items-center justify-center text-white shadow-sm shrink-0">
            <span className="text-[7px] uppercase tracking-wider font-extrabold text-fahy-yellow/70 leading-none">
              Level
            </span>
            <span className="text-sm font-black font-mono leading-none mt-0.5">
              {level}
            </span>
          </div>
          {xpInLevel >= 80 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-[8px] font-bold px-1 rounded-full animate-bounce">
              🔥
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center text-[8px] font-black text-forest/65 uppercase leading-none mb-1">
            <span>EXP Progress</span>
            <span>{xpInLevel}/100</span>
          </div>
          <div className="h-2.5 bg-forest/[0.07] border border-forest/10 rounded-full overflow-hidden p-[1px] relative">
            <motion.div
              className="h-full bg-linear-to-r from-emerald-500 to-sage-deep rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            />
            {/* Subtle glow spark on fill */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* CURRENCIES & POINTS HUD GAUGE */}
      <div className="flex items-center gap-2">
        {/* Peach Coins */}
        <motion.div
          animate={coinGlow ? { scale: [1, 1.25, 1], y: [0, -4, 0] } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all shadow-2xs ${
            coinGlow
              ? "bg-fahy-yellow/20 border-fahy-yellow text-forest font-black"
              : "bg-white border-black/5 text-forest/80 font-bold"
          }`}
        >
          <span className="text-sm animate-pulse">🍑</span>
          <span className="text-xs font-mono tracking-tight">{coins}</span>
        </motion.div>

        {/* Eco points */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl border bg-white border-black/5 text-forest/80 font-bold shadow-2xs">
          <Star className="w-3.5 h-3.5 text-peach fill-peach" />
          <span className="text-xs font-mono tracking-tight">{points}</span>
          <span className="text-[7px] uppercase font-black text-forest/40 ml-0.5">
            PTS
          </span>
        </div>

        {/* RETRO SOUND EFFECT TOGGLE */}
        <button
          onClick={handleToggleMute}
          title={muted ? "Unmute Sounds" : "Mute Sounds"}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
            muted
              ? "bg-black/5 border-transparent text-forest/40"
              : "bg-forest/5 border-forest/10 text-forest hover:bg-forest/10"
          }`}
        >
          {muted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* LEVEL UP CELEBRATION MODAL */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/80 backdrop-blur-md">
            {/* Ambient Confetti Sparkle background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: -50,
                    x: Math.random() * window.innerWidth,
                    opacity: 1,
                    scale: 0.5 + Math.random(),
                  }}
                  animate={{
                    y: window.innerHeight + 50,
                    x: `calc(${Math.random() * window.innerWidth}px + ${(Math.random() - 0.5) * 200}px)`,
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute text-2xl select-none"
                >
                  {["🌸", "🍑", "✨", "🍃", "🎈", "🎉"][i % 6]}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white border-4 border-fahy-yellow rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Golden Sunburst behind */}
              <div className="absolute -top-10 inset-x-0 h-44 bg-gradient-to-b from-fahy-yellow/10 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <span className="text-5xl animate-bounce inline-block mb-3">
                  🧚‍♀️
                </span>

                <h3 className="font-display font-black text-3xl text-forest uppercase tracking-tight">
                  Level Up!
                </h3>

                <div className="inline-block mt-2 px-6 py-2 bg-forest text-fahy-yellow rounded-full font-black text-xl border-2 border-fahy-yellow/50 shadow-md">
                  Level {level}
                </div>

                <p className="text-sm font-semibold text-forest/70 mt-6 leading-relaxed">
                  "Congratulations! Your alignment with the neighborhood
                  ecosystems has strengthened Fahy's magic power! Keep
                  exploring!"
                </p>

                {/* Rewards Showcase */}
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mt-6 text-left space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                    Level Up Rewards Unlocked:
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍑</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-forest">
                        +50 Peach Coins Awarded!
                      </p>
                      <p className="text-[10px] text-forest/60">
                        Ready to spend in the boutique shop!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-forest">
                        +100 Style Bonus Points
                      </p>
                      <p className="text-[10px] text-forest/60">
                        Added to your global rank standing
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    gameSounds.play("success");
                    setShowLevelUp(false);
                  }}
                  className="w-full mt-6 bg-forest hover:bg-forest/90 text-white font-extrabold py-3 rounded-2xl active:scale-[0.98] transition-transform shadow-md"
                >
                  Awesome, claim rewards!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
