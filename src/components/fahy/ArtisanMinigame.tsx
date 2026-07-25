import { useState, useEffect } from "react";
import { useAppState } from "@/lib/AppState";
import { useLang } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  Check,
  ChevronRight,
  Palette,
  Droplet,
  Scissors,
} from "lucide-react";

interface ArtisanMinigameProps {
  trackId: string; // "tea" | "indigo" | "bamboo" | "paper" | "lantern"
  badgeKey: string;
  badgeName: string;
  badgeEmoji: string;
  onSuccess: (badgeKey: string) => void;
  onClose: () => void;
}

export function ArtisanMinigame({
  trackId,
  badgeKey,
  badgeName,
  badgeEmoji,
  onSuccess,
  onClose,
}: ArtisanMinigameProps) {
  const { addCoins, addPoints, addXp } = useAppState();
  const { formatCoins } = useLang();

  // Mini-game states
  const [gameState, setGameState] = useState<
    "intro" | "playing" | "success" | "fail"
  >("intro");

  // Game 1: Tea Sommelier States
  const [temperature, setTemperature] = useState(60);
  const [steepTime, setSteepTime] = useState(0);
  const [teaStep, setTeaStep] = useState<"heating" | "steeping" | "poured">(
    "heating",
  );
  const [targetTemp] = useState(95); // Target Oolong Temp
  const [finalTemp, setFinalTemp] = useState<number | null>(null);
  const [finalSteep, setFinalSteep] = useState<number | null>(null);

  // Game 2: Indigo Dye States
  const [foldPattern, setFoldPattern] = useState<
    "spiral" | "cloud" | "mandala"
  >("spiral");
  const [dyeSaturation, setDyeSaturation] = useState(30); // 0 to 100
  const [dyeTimeLeft, setDyeTimeLeft] = useState(10); // 10s game
  const [saturationHistory, setSaturationHistory] = useState<number[]>([]);

  // Game 3: Bamboo Rhythm States
  const [rhythmBeat, setRhythmBeat] = useState(0);
  const [beatsNeeded] = useState(5);
  const [beatActive, setBeatActive] = useState(false);
  const [perfectHits, setPerfectHits] = useState(0);
  const [indicatorPos, setIndicatorPos] = useState(0); // 0 to 100 slider pos

  // -------------------------
  // GAME 1: TEA SOMMELIER LOOP
  // -------------------------
  useEffect(() => {
    if (trackId !== "tea" || gameState !== "playing") return;

    let timer: NodeJS.Timeout;

    if (teaStep === "heating") {
      timer = setInterval(() => {
        setTemperature((prev) => {
          if (prev >= 110) {
            setTeaStep("steeping");
            setFinalTemp(prev);
            return prev;
          }
          return prev + 1.8;
        });
      }, 50);
    } else if (teaStep === "steeping") {
      timer = setInterval(() => {
        setSteepTime((prev) => prev + 0.05);
      }, 50);
    }

    return () => clearInterval(timer);
  }, [trackId, gameState, teaStep]);

  const handleStopHeater = () => {
    setFinalTemp(Math.round(temperature));
    setTeaStep("steeping");
  };

  const handlePourTea = () => {
    setFinalSteep(parseFloat(steepTime.toFixed(2)));
    setTeaStep("poured");

    // Evaluate Tea Sommelier outcome
    // Perfect: Temp is 93-97°C, Steep time is 4.5s - 5.5s
    const isTempOk =
      Math.abs((finalTemp || Math.round(temperature)) - targetTemp) <= 4;
    const isSteepOk = Math.abs(parseFloat(steepTime.toFixed(2)) - 5.0) <= 0.8;

    if (isTempOk && isSteepOk) {
      triggerSuccess(50, 40, 20);
    } else {
      setGameState("fail");
    }
  };

  // -------------------------
  // GAME 2: INDIGO DYE LOOP
  // -------------------------
  useEffect(() => {
    if (trackId !== "indigo" || gameState !== "playing") return;

    // Saturation decays naturally over time, user must stir to increase it
    const timer = setInterval(() => {
      setDyeSaturation((prev) => Math.max(0, prev - 3));
      setDyeTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Evaluate Dye Saturation average (must be in 55-85 zone for >= 60% of time)
          const validHistoryCount = saturationHistory.filter(
            (s) => s >= 50 && s <= 85,
          ).length;
          const ratio =
            validHistoryCount / Math.max(1, saturationHistory.length);
          if (ratio >= 0.5) {
            triggerSuccess(60, 50, 25);
          } else {
            setGameState("fail");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Record saturation history for final scoring
    const recordTimer = setInterval(() => {
      setSaturationHistory((prev) => [...prev, dyeSaturation]);
    }, 200);

    return () => {
      clearInterval(timer);
      clearInterval(recordTimer);
    };
  }, [trackId, gameState, dyeSaturation, saturationHistory]);

  const handleStirVat = () => {
    setDyeSaturation((prev) => Math.min(100, prev + 14));
  };

  // -------------------------
  // GAME 3: BAMBOO WEAVING LOOP
  // -------------------------
  useEffect(() => {
    if (trackId !== "bamboo" || gameState !== "playing") return;

    // Sliding indicator bar speed
    const sliderTimer = setInterval(() => {
      setIndicatorPos((prev) => {
        const next = prev + 3.2;
        if (next >= 100) {
          return 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(sliderTimer);
  }, [trackId, gameState]);

  const handleTapWeave = () => {
    // Perfect hit zone: indicatorPos is between 42% and 58%
    const isPerfect = indicatorPos >= 42 && indicatorPos <= 58;

    if (isPerfect) {
      setPerfectHits((prev) => {
        const next = prev + 1;
        setBeatActive(true);
        setTimeout(() => setBeatActive(false), 200);

        if (next >= beatsNeeded) {
          triggerSuccess(55, 45, 20);
        }
        return next;
      });
    } else {
      setGameState("fail");
    }
  };

  // Generic success trigger
  const triggerSuccess = (
    coinsReward: number,
    pointsReward: number,
    xpReward: number,
  ) => {
    setGameState("success");
    addCoins(coinsReward, `Completed Craft Game: ${badgeName}`);
    addPoints(pointsReward);
    addXp(xpReward);
    onSuccess(badgeKey);
  };

  const handleResetGame = () => {
    setGameState("playing");
    setTemperature(60);
    setSteepTime(0);
    setTeaStep("heating");
    setFinalTemp(null);
    setFinalSteep(null);
    setDyeSaturation(30);
    setDyeTimeLeft(10);
    setSaturationHistory([]);
    setPerfectHits(0);
    setIndicatorPos(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/90 backdrop-blur-md flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="bg-white text-forest rounded-3xl p-6 max-w-sm w-full border-4 border-fahy-yellow relative overflow-hidden shadow-2xl">
        {/* Decorative background lights */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-fahy-yellow/15 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-peach/15 rounded-full" />

        <AnimatePresence mode="wait">
          {/* STAGE 1: INTRO */}
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="text-4xl bg-fahy-yellow/20 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                {badgeEmoji}
              </div>
              <h3 className="font-display font-extrabold text-xl leading-tight">
                {badgeName} Challenge
              </h3>
              <p className="text-[10px] text-forest/50 font-bold uppercase tracking-widest mt-1">
                Apprentice Craft Simulator
              </p>

              <div className="bg-surface border border-black/5 rounded-2xl p-4 my-6 text-left text-xs">
                <p className="font-bold text-forest mb-2">How to Play:</p>
                {trackId === "tea" && (
                  <ul className="space-y-1.5 list-disc list-inside text-forest/70 leading-relaxed font-semibold">
                    <li>
                      Heat water and stop exactly at{" "}
                      <span className="text-peach font-extrabold">95°C</span>.
                    </li>
                    <li>
                      Steep the tea leaves and pour exactly at{" "}
                      <span className="text-peach font-extrabold">
                        5.00 seconds
                      </span>
                      .
                    </li>
                  </ul>
                )}
                {trackId === "indigo" && (
                  <ul className="space-y-1.5 list-disc list-inside text-forest/70 leading-relaxed font-semibold">
                    <li>Dye the fabric in the natural fermenting indigo.</li>
                    <li>
                      Keep clicking{" "}
                      <span className="text-indigo-600 font-extrabold">
                        Stir Vat
                      </span>{" "}
                      to stay inside the Green Zone (50%-85% saturation) for 10
                      seconds!
                    </li>
                  </ul>
                )}
                {trackId === "bamboo" && (
                  <ul className="space-y-1.5 list-disc list-inside text-forest/70 leading-relaxed font-semibold">
                    <li>
                      Weave bamboo fibers into a traditional load-bearing
                      basket.
                    </li>
                    <li>
                      Tap the{" "}
                      <span className="text-emerald-600 font-extrabold">
                        Weave
                      </span>{" "}
                      button exactly when the moving bar crosses the center
                      highlight!
                    </li>
                  </ul>
                )}
                {trackId !== "tea" &&
                  trackId !== "indigo" &&
                  trackId !== "bamboo" && (
                    <p className="text-forest/70">
                      Prove your knowledge of traditional local Fa Hui crafts in
                      a speed-preservation game!
                    </p>
                  )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-black/10 py-2.5 rounded-full text-xs font-bold text-forest hover:bg-surface active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setGameState("playing")}
                  className="flex-1 bg-forest text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Start Game</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: PLAYING WORKSHOP */}
          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* GAME 1: TEA SOMMELIER */}
              {trackId === "tea" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs font-bold text-forest/50">
                    <span>Lin's Tea House</span>
                    <span className="text-emerald-600">Oolong Standard</span>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col items-center justify-center relative">
                    <span className="text-5xl animate-bounce mb-3">🍵</span>

                    {teaStep === "heating" && (
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Water Temperature</span>
                          <span className="text-orange-500 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 fill-orange-500" />
                            {Math.round(temperature)}°C
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-black/[0.05] rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full"
                            style={{ width: `${(temperature / 110) * 100}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-forest/40 font-bold">
                          Target: {targetTemp}°C (Press STOP when hot!)
                        </p>
                      </div>
                    )}

                    {teaStep === "steeping" && (
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Steeping Leaves</span>
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {steepTime.toFixed(2)}s
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-black/[0.05] rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${(steepTime / 6.0) * 100}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-forest/40 font-bold">
                          Target: 5.00 seconds (Press POUR to steep!)
                        </p>
                      </div>
                    )}

                    {teaStep === "poured" && (
                      <div className="text-xs space-y-1 font-semibold text-forest/70">
                        <p>Boiled: {finalTemp}°C (Target: 95°C)</p>
                        <p>Steeped: {finalSteep}s (Target: 5s)</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {teaStep === "heating" && (
                      <button
                        onClick={handleStopHeater}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Flame className="w-4 h-4 fill-white" />
                        <span>Stop Heater & Infuse</span>
                      </button>
                    )}
                    {teaStep === "steeping" && (
                      <button
                        onClick={handlePourTea}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Pour Brew Now</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* GAME 2: INDIGO DYEING */}
              {trackId === "indigo" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-forest/50">
                    <span>Old Town Indigo</span>
                    <span className="text-indigo-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {dyeTimeLeft}s Remaining
                    </span>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 flex flex-col items-center justify-center">
                    {/* Visual pattern representation based on fold type */}
                    <div className="w-24 h-24 border border-black/5 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden mb-4 shadow-inner">
                      <div
                        className="absolute w-20 h-20 border-4 border-indigo-700/60 rounded-full animate-spin"
                        style={{
                          transform: `scale(${0.2 + dyeSaturation / 100})`,
                          borderRadius:
                            foldPattern === "spiral"
                              ? "50%"
                              : foldPattern === "cloud"
                                ? "30%"
                                : "0%",
                          animationDuration: "12s",
                        }}
                      />
                      <Palette className="w-8 h-8 text-indigo-900/40 relative z-10" />
                    </div>

                    {/* Saturation Gauge with Target Zone highlighted */}
                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Indigo Saturation</span>
                        <span className="text-indigo-700 font-extrabold">
                          {dyeSaturation}%
                        </span>
                      </div>
                      <div className="w-full h-6 bg-black/[0.05] rounded-xl overflow-hidden relative border border-black/[0.03]">
                        {/* Target Green Saturation Highlighted zone (50% to 85%) */}
                        <div className="absolute left-[50%] right-[15%] h-full bg-emerald-500/20 border-x border-emerald-500/30" />
                        <div
                          className="bg-indigo-700 h-full rounded-l-xl transition-all duration-300"
                          style={{ width: `${dyeSaturation}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-emerald-600 font-bold">
                        Keep gauge within central highlighted range!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStirVat}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform mt-2"
                  >
                    <Droplet className="w-4 h-4 fill-white text-white" />
                    <span>Stir Vat (+14% Saturation)</span>
                  </button>
                </div>
              )}

              {/* GAME 3: BAMBOO WEAVING */}
              {trackId === "bamboo" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-forest/50">
                    <span>Bamboo & Co.</span>
                    <span className="text-emerald-600 font-extrabold">
                      Crafted: {perfectHits} / {beatsNeeded}
                    </span>
                  </div>

                  <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-5 flex flex-col items-center justify-center relative">
                    <span className="text-4xl mb-3 animate-pulse">🧺</span>

                    {/* Rhythm Timeline Bar */}
                    <div className="w-full h-12 bg-black/[0.06] rounded-2xl relative border border-black/[0.03] overflow-hidden flex items-center">
                      {/* Perfect Hit highlight window (42% to 58%) */}
                      <div className="absolute left-[42%] right-[42%] h-full bg-emerald-500/20 border-x-2 border-emerald-500/40" />

                      {/* Moving Indicator needle */}
                      <div
                        className="absolute w-1.5 h-10 bg-forest rounded-full transition-all"
                        style={{ left: `${indicatorPos}%` }}
                      />
                    </div>

                    {/* Visual burst animation on click */}
                    <AnimatePresence>
                      {beatActive && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 1 }}
                          animate={{ scale: 1.4, opacity: 0 }}
                          className="absolute text-emerald-500 font-extrabold text-sm font-display pointer-events-none"
                        >
                          ✨ PERFECT HIT!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={handleTapWeave}
                    className="w-full bg-forest hover:bg-forest/95 text-white font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform mt-2"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Weave Bamboo Fiber</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 3: FAIL */}
          {gameState === "fail" && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <span className="text-5xl mb-4 block">🥀</span>
              <h3 className="font-display font-extrabold text-xl leading-none">
                Craft Failed
              </h3>
              <p className="text-xs text-forest/50 mt-1 uppercase font-bold tracking-widest">
                Master's Critique
              </p>

              <div className="bg-peach/10 border border-peach/30 text-peach rounded-2xl p-4 my-6 text-xs text-left">
                {trackId === "tea" && (
                  <p className="font-semibold leading-relaxed">
                    "Your oolong leaves were scorched or raw, neighbor. Oolong
                    tea must be steeped in clay pots around 95°C for exactly 5
                    seconds to draw out its authentic peach blossom notes."
                  </p>
                )}
                {trackId === "indigo" && (
                  <p className="font-semibold leading-relaxed">
                    "The fabric sat too long unstirred, causing the dye
                    concentration to become uneven and spotty. Natural
                    fermentation requires constant, structured care."
                  </p>
                )}
                {trackId === "bamboo" && (
                  <p className="font-semibold leading-relaxed">
                    "Your splits were unaligned, snapping the raw bamboo fibers.
                    Weaving is a rhythmic cycle. Align your taps perfectly!"
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-black/10 py-2.5 rounded-full text-xs font-bold text-forest hover:bg-surface active:scale-95 transition-all"
                >
                  Give Up
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex-1 bg-forest text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Craft</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: SUCCESS */}
          {gameState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3">
                <Check className="w-6 h-6" strokeWidth={3} />
              </div>
              <span className="text-[10px] text-sage-deep font-bold uppercase tracking-wider">
                Craft Preserved!
              </span>
              <h3 className="font-display font-extrabold text-xl leading-tight mt-1">
                Unlocked {badgeEmoji} {badgeName}!
              </h3>

              <div className="bg-fahy-yellow/15 border border-fahy-yellow/30 rounded-2xl p-4 my-5 flex items-center justify-around text-center">
                <div>
                  <p className="text-[8px] font-bold uppercase text-forest/40">
                    Peach Coins
                  </p>
                  <p className="text-sm font-extrabold text-forest">+50</p>
                </div>
                <div className="w-px h-6 bg-forest/10" />
                <div>
                  <p className="text-[8px] font-bold uppercase text-forest/40">
                    Standings
                  </p>
                  <p className="text-sm font-extrabold text-forest">+500 PTS</p>
                </div>
                <div className="w-px h-6 bg-forest/10" />
                <div>
                  <p className="text-[8px] font-bold uppercase text-forest/40">
                    XP Gained
                  </p>
                  <p className="text-sm font-extrabold text-forest">+25 XP</p>
                </div>
              </div>

              <p className="text-xs text-forest/60 mb-6 leading-relaxed px-2 font-medium">
                The grandmaster is impressed with your traditional splits and
                steeps, neighbor. This badge is now permanently added to your
                Passport!
              </p>

              <button
                onClick={onClose}
                className="w-full bg-forest text-white py-2.5 rounded-full text-xs font-bold active:scale-95 transition-all shadow-sm"
              >
                Claim & Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
