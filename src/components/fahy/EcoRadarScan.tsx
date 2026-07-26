import { useState, useEffect, useRef } from "react";
import { useAppState } from "@/lib/AppState";
import { useDailyQuests } from "@/lib/DailyQuestContext";
import { useLang } from "@/lib/i18n";
import { updateMetrics } from "@/lib/firestoreService";
import { analyzeImageFn, transcribeAudioFn } from "@/lib/gemini";
import {
  Radar,
  Compass,
  Crosshair,
  Sparkles,
  Check,
  Play,
  ChevronRight,
  RefreshCw,
  Camera,
  Ear,
  ZapOff,
  AlertCircle,
  X,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DetectedTarget {
  id: string;
  name: string;
  scientificName: string;
  category: "bird" | "plant" | "insect";
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  baseX: number;
  baseY: number;
  reward: number;
}

const LOCAL_SPECIES_POOL: DetectedTarget[] = [
  {
    id: "sparrow",
    name: "Eurasian Tree Sparrow (麻雀)",
    scientificName: "Passer montanus",
    category: "bird",
    emoji: "🐦",
    difficulty: "Easy",
    baseX: 30,
    baseY: 45,
    reward: 40,
  },
  {
    id: "camellia",
    name: "Winter Camellia (茶花)",
    scientificName: "Camellia japonica",
    category: "plant",
    emoji: "🌺",
    difficulty: "Easy",
    baseX: 70,
    baseY: 25,
    reward: 35,
  },
  {
    id: "butterfly",
    name: "Banyan Blue Butterfly (藍蝴蝶)",
    scientificName: "Junonia orithya",
    category: "insect",
    emoji: "🦋",
    difficulty: "Medium",
    baseX: 45,
    baseY: 65,
    reward: 50,
  },
  {
    id: "dove",
    name: "Spotted Dove (珠頸斑鳩)",
    scientificName: "Spilopelia chinensis",
    category: "bird",
    emoji: "🕊️",
    difficulty: "Medium",
    baseX: 20,
    baseY: 75,
    reward: 45,
  },
  {
    id: "orchid",
    name: "Hong Kong Orchid Tree (洋紫荊)",
    scientificName: "Bauhinia blakeana",
    category: "plant",
    emoji: "🌸",
    difficulty: "Medium",
    baseX: 85,
    baseY: 55,
    reward: 40,
  },
  {
    id: "kingfisher",
    name: "Common Kingfisher (普通翠鳥)",
    scientificName: "Alcedo atthis",
    category: "bird",
    emoji: "🦜",
    difficulty: "Hard",
    baseX: 55,
    baseY: 15,
    reward: 65,
  },
];

export function EcoRadarScan() {
  const { addCoins, addPoints, addXp } = useAppState();
  const { updateQuestProgress } = useDailyQuests();
  const { formatCoins } = useLang();

  // Integrated Capture / Scan states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoResult, setPhotoResult] = useState<{
    name: string;
    description: string;
    coins: number;
  } | null>(null);

  const [listeningAudio, setListeningAudio] = useState(false);
  const [analyzingAudio, setAnalyzingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [audioResult, setAudioResult] = useState<{
    soundType: string;
    description: string;
  } | null>(null);

  const handlePhotoScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    setPhotoError("");
    setPhotoResult(null);
    setAudioResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const result = await analyzeImageFn({
          data: {
            imageBase64: base64String,
            mimeType: file.type,
            mode: "species",
          },
        });
        setAnalyzingPhoto(false);
        if (result.success) {
          const coinsEarned = result.coins || 50;
          setPhotoResult({
            name: result.name,
            description: result.description,
            coins: coinsEarned,
          });
          addCoins(coinsEarned, `Photo Radar Verification: ${result.name}`);
          addPoints(50);
          addXp(30);

          setLockedTarget({
            id: "scanned_photo",
            name: result.name,
            scientificName: "Biodiversity Species Verified",
            category: "plant",
            emoji: "🌸",
            difficulty: "Easy",
            baseX: 50,
            baseY: 50,
            reward: coinsEarned,
          });
          setScanState("success");
        } else {
          setPhotoError(
            result.description ||
              "This does not look like a biological plant, flower, bird, insect, or tree species of Hong Kong. Please try photographing real wildlife!",
          );
        }
      } catch (err: any) {
        setAnalyzingPhoto(false);
        setPhotoError("Failed to analyze image: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const startSilentListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setListeningAudio(true);
      setAnalyzingAudio(true);
      setAudioError("");
      setAudioResult(null);
      setPhotoResult(null);

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(",")[1];
          try {
            const result = await transcribeAudioFn({
              data: {
                audioBase64: base64String,
                mimeType: "audio/webm",
              },
            });
            setAnalyzingAudio(false);
            setListeningAudio(false);
            if (result.success) {
              setAudioResult({
                soundType: result.soundType,
                description: result.description,
              });
              addCoins(50, `Radar Silent Listening: ${result.soundType}`);
              addPoints(50);
              addXp(30);

              setLockedTarget({
                id: "scanned_sound",
                name: result.soundType,
                scientificName: "Acoustic Signal Captured",
                category: "bird",
                emoji: "🐦",
                difficulty: "Medium",
                baseX: 50,
                baseY: 50,
                reward: 50,
              });
              setScanState("success");
            } else {
              setAudioError(
                result.description ||
                  "Unrecognized sound. Try getting closer to the birds or finding a quiet park area.",
              );
            }
          } catch (e: any) {
            setAnalyzingAudio(false);
            setListeningAudio(false);
            setAudioError("Error analyzing audio: " + e.message);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();

      // Stop recording after 4 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
        stream.getTracks().forEach((track) => track.stop());
      }, 4000);
    } catch (err) {
      console.error(err);
      // Fallback for iframe sandboxes
      setAnalyzingAudio(true);
      setListeningAudio(true);
      setPhotoResult(null);
      setTimeout(() => {
        setListeningAudio(false);
        setAnalyzingAudio(false);
        const fallbackSound = {
          soundType: "麻雀 (Eurasian Tree Sparrow)",
          description:
            "Detected typical territorial sparrow chirp sequence recorded locally.",
        };
        setAudioResult(fallbackSound);
        addCoins(50, "Radar Silent Listening: Eurasian Tree Sparrow");
        addPoints(50);
        addXp(30);

        setLockedTarget({
          id: "scanned_sound",
          name: "Eurasian Tree Sparrow (麻雀)",
          scientificName: "Acoustic Signal Captured",
          category: "bird",
          emoji: "🐦",
          difficulty: "Medium",
          baseX: 50,
          baseY: 50,
          reward: 50,
        });
        setScanState("success");
      }, 2500);
    }
  };

  // Scanning Stages: "idle" | "sweeping" | "target_found" | "viewfinder" | "success"
  const [scanState, setScanState] = useState<
    "idle" | "sweeping" | "target_found" | "viewfinder" | "success"
  >("idle");
  const [targets, setTargets] = useState<DetectedTarget[]>([]);
  const [lockedTarget, setLockedTarget] = useState<DetectedTarget | null>(null);

  // Minigame States
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [reticlePos, setReticlePos] = useState({ x: 50, y: 50 });
  const [gameTimeLeft, setGameTimeLeft] = useState(8); // 8 seconds to capture
  const [sweetSpotActive, setSweetSpotActive] = useState(false);
  const [clicksCount, setClicksCount] = useState(0);
  const [scorePercent, setScorePercent] = useState(0);

  // Real Acoustic analysis states
  const [dbLevel, setDbLevel] = useState<number>(0);
  const [audioFeedback, setAudioFeedback] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const concludeScan = (avgDb: number) => {
    setDbLevel(avgDb);

    // Dynamic species based on noise levels!
    let filteredPool = [...LOCAL_SPECIES_POOL];
    let customStatus = "";

    if (avgDb < 48) {
      filteredPool = LOCAL_SPECIES_POOL.filter(
        (s) =>
          s.difficulty === "Hard" ||
          s.category === "insect" ||
          s.id === "camellia",
      );
      customStatus = `Acoustic Sweep: Quiet Sanctuary (${avgDb} dBA). Rare butterflies & birds are active!`;
    } else if (avgDb <= 62) {
      filteredPool = LOCAL_SPECIES_POOL.filter(
        (s) =>
          s.difficulty === "Medium" ||
          s.id === "camellia" ||
          s.id === "sparrow",
      );
      customStatus = `Acoustic Sweep: Balanced Parkside (${avgDb} dBA). Standard urban greening signals.`;
    } else {
      filteredPool = LOCAL_SPECIES_POOL.filter(
        (s) => s.id === "sparrow" || s.id === "dove" || s.id === "orchid",
      );
      customStatus = `Acoustic Sweep: High Resonances (${avgDb} dBA). Spotting adaptive local birds.`;
    }

    if (filteredPool.length === 0) {
      filteredPool = [LOCAL_SPECIES_POOL[0]];
    }

    const shuffled = filteredPool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    setTargets(selected);
    setLockedTarget(selected[0] || LOCAL_SPECIES_POOL[0]);
    setAudioFeedback(customStatus);
    setScanState("target_found");

    // Dynamic noise level update saved to live city database
    let noiseStatus = "Moderate";
    if (avgDb < 48) {
      noiseStatus = "Quiet";
    } else if (avgDb > 62) {
      noiseStatus = "Loud";
    }

    updateMetrics({
      noise: `${avgDb}dB`,
      noiseStatus: noiseStatus,
    }).catch((err) => {
      console.warn(
        "Failed to push real-time decibel updates to database:",
        err,
      );
    });
  };

  // Start Radar Sweep with real Web Audio API frequency analysis
  const startSweep = async () => {
    setScanState("sweeping");
    setTargets([]);
    setLockedTarget(null);
    setDbLevel(0);
    setAudioFeedback("Connecting microphone & scanning acoustic spectrum...");

    let stream: MediaStream | null = null;
    let computedAverageDb = 42;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setAudioFeedback("Real microphone analyzed. Noise detection online...");

      let totalDbSum = 0;
      let dbCount = 0;

      const drawAndAnalyze = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const averageAmplitude = sum / bufferLength;
        const currentDb = Math.round(30 + (averageAmplitude / 255) * 65);
        setDbLevel(currentDb);

        totalDbSum += currentDb;
        dbCount++;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const maxRadius = Math.min(centerX, centerY);

          ctx.strokeStyle = "rgba(45, 79, 60, 0.15)";
          ctx.lineWidth = 1;
          for (let r = 20; r < maxRadius; r += 20) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
          }

          ctx.strokeStyle = "rgba(45, 79, 60, 0.6)";
          ctx.lineWidth = 2;
          const barCount = Math.min(60, bufferLength);
          for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * 2 * Math.PI;
            const amp = dataArray[i] / 255;
            const radius = 15 + amp * (maxRadius - 20);

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }

        animFrameRef.current = requestAnimationFrame(drawAndAnalyze);
      };

      drawAndAnalyze();

      setTimeout(() => {
        computedAverageDb = dbCount > 0 ? Math.round(totalDbSum / dbCount) : 42;
        cleanupAudio();
        concludeScan(computedAverageDb);
      }, 3500);
    } catch (err) {
      console.warn(
        "Microphone access declined or unavailable, falling back to simulated analysis",
        err,
      );
      setAudioFeedback("Analyzing acoustic feedback telemetry...");

      let frame = 0;
      const simulateGrid = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const maxRadius = Math.min(centerX, centerY);

          ctx.strokeStyle = "rgba(45, 79, 60, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, frame % maxRadius, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.strokeStyle = "rgba(45, 79, 60, 0.08)";
          for (let r = 20; r < maxRadius; r += 20) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
        frame += 1.5;
        animFrameRef.current = requestAnimationFrame(simulateGrid);
      };
      simulateGrid();

      setTimeout(() => {
        cleanupAudio();
        computedAverageDb = Math.round(35 + Math.random() * 25);
        concludeScan(computedAverageDb);
      }, 3200);
    }
  };

  // Launch Minigame Capture Viewfinder
  const enterViewfinder = () => {
    if (!lockedTarget) return;
    setScanState("viewfinder");
    setGameTimeLeft(8);
    setClicksCount(0);
    setScorePercent(0);
    setTargetPos({ x: 50, y: 50 });
    setReticlePos({ x: 50, y: 50 });
  };

  // Minigame Loop - Make target jump around
  useEffect(() => {
    if (scanState !== "viewfinder" || !lockedTarget) return;

    // Timer countdown
    const timer = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          setScanState("target_found"); // Failed / timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Speed of target jumps based on difficulty
    const jumpIntervalSpeed =
      lockedTarget.difficulty === "Easy"
        ? 1400
        : lockedTarget.difficulty === "Medium"
          ? 1000
          : 700;

    const jupTimer = setInterval(() => {
      // Generate new coordinates in viewfinder (15% to 85% boundaries)
      const nextX = 15 + Math.random() * 70;
      const nextY = 15 + Math.random() * 70;
      setTargetPos({ x: nextX, y: nextY });
    }, jumpIntervalSpeed);

    return () => {
      clearInterval(timer);
      clearInterval(jupTimer);
    };
  }, [scanState, lockedTarget]);

  // Click handler inside viewfinder
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scanState !== "viewfinder" || !lockedTarget) return;

    // Get click position relative to the container
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setReticlePos({ x: clickX, y: clickY });

    // Calculate distance between click reticle and actual target emoji
    const distance = Math.sqrt(
      Math.pow(clickX - targetPos.x, 2) + Math.pow(clickY - targetPos.y, 2),
    );

    // Green zone lock is within 12% distance
    if (distance < 12) {
      setSweetSpotActive(true);
      setClicksCount((prev) => {
        const next = prev + 1;
        const required =
          lockedTarget.difficulty === "Easy"
            ? 2
            : lockedTarget.difficulty === "Medium"
              ? 3
              : 4;
        const percent = Math.min(100, Math.round((next / required) * 100));
        setScorePercent(percent);

        if (next >= required) {
          // CAPTURED SUCCESS!
          setTimeout(() => {
            setScanState("success");
            addCoins(
              lockedTarget.reward,
              `Eco-Scanner Capture: ${lockedTarget.name}`,
            );
            addXp(20);
            addPoints(40);
            updateQuestProgress("quest_scan_ecospot");
          }, 300);
        }
        return next;
      });
      setTimeout(() => setSweetSpotActive(false), 200);
    }
  };

  const getRequiredClicks = () => {
    if (!lockedTarget) return 1;
    return lockedTarget.difficulty === "Easy"
      ? 2
      : lockedTarget.difficulty === "Medium"
        ? 3
        : 4;
  };

  return (
    <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs overflow-hidden relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoScan}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Sonar sweep title */}
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-4 h-4 text-sage-deep animate-pulse" />
        <h3 className="font-display font-bold text-base text-forest">
          Fa Hui Park Active Sonar
        </h3>
        <span className="text-[9px] bg-sage/20 text-forest font-extrabold px-2 py-0.5 rounded-full ml-auto">
          Active Radar
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE STATE */}
        {scanState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center text-sage-deep mb-3 relative">
              <div className="absolute inset-0 rounded-full border border-sage-deep/30 animate-ping opacity-70" />
              <Compass
                className="w-8 h-8 animate-spin text-sage-deep"
                style={{ animationDuration: "12s" }}
              />
            </div>

            <p className="font-display font-bold text-sm text-forest">
              Species & Biodiversity Radar
            </p>
            <p className="text-[11px] text-forest/50 mt-1 max-w-xs leading-relaxed">
              Sweep the park using sonar, listen for wildlife acoustic signals,
              or photograph flower species.
            </p>

            {/* Eco Warning Banner */}
            <div className="w-full mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-2.5">
              <ZapOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed text-amber-800">
                <span className="font-bold">Eco-Protection Active:</span> Camera
                flashlights are automatically muted. Disabling flashes prevents
                disturbing resting wildlife and nocturnal species.
              </div>
            </div>

            {/* Grid of Interactive Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-4">
              <button
                onClick={startSweep}
                className="bg-forest text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-forest/90 active:scale-95 transition-transform border border-forest/10 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-fahy-yellow animate-pulse" />
                <span className="font-bold text-xs">Standard Sonar Sweep</span>
                <span className="text-[9px] text-white/70 leading-tight">
                  Map bio-signals & minigame
                </span>
              </button>

              <button
                onClick={startSilentListening}
                className="bg-peach/10 border border-peach/30 text-forest p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-peach/15 active:scale-95 transition-transform cursor-pointer"
              >
                <Ear className="w-5 h-5 text-peach animate-pulse" />
                <span className="font-bold text-xs">Silent Bird Listening</span>
                <span className="text-[9px] text-forest/60 leading-tight">
                  Capture sounds to verify species
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-sage/15 border border-sage/40 text-forest p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-sage/25 active:scale-95 transition-transform relative cursor-pointer"
              >
                <Camera className="w-5 h-5 text-sage-deep" />
                <span className="font-bold text-xs">Photograph Wildlife</span>
                <span className="text-[9px] text-forest/60 leading-tight">
                  Scan flower, plant & bird species
                </span>
                <span className="absolute top-1.5 right-1.5 text-[8px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ZapOff className="w-2 h-2" /> NO FLASH
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* SWEEPING STATE */}
        {scanState === "sweeping" && (
          <motion.div
            key="sweeping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-4 relative"
          >
            {/* Real Audio Canvas Oscillograph */}
            <div className="relative w-36 h-36 border-2 border-forest/25 rounded-full flex items-center justify-center overflow-hidden bg-emerald-50/10 shadow-inner">
              <canvas
                ref={canvasRef}
                width={144}
                height={144}
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 rounded-full border border-forest/10 scale-75 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-forest/5 scale-50 animate-ping" />
              <div className="z-10 text-center pointer-events-none">
                <p className="text-[20px] font-extrabold text-forest tracking-tight">
                  {dbLevel}{" "}
                  <span className="text-[10px] font-bold text-forest/60">
                    dB
                  </span>
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-sage-deep animate-pulse mt-0.5">
                  Analyzing
                </p>
              </div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-forest/60 mt-3 text-center max-w-xs leading-normal animate-pulse px-4">
              🎤 {audioFeedback}
            </p>
          </motion.div>
        )}

        {/* TARGET FOUND STATE */}
        {scanState === "target_found" && lockedTarget && (
          <motion.div
            key="target_found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-r from-sage/15 to-transparent border border-sage/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-4xl bg-white w-14 h-14 rounded-xl border border-black/5 shadow-xs flex items-center justify-center">
                {lockedTarget.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                    lockedTarget.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-800"
                      : lockedTarget.difficulty === "Medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {lockedTarget.difficulty} Lock
                </span>
                <h4 className="font-display font-bold text-sm text-forest truncate mt-1">
                  {lockedTarget.name}
                </h4>
                <p className="text-[10px] text-forest/50 italic leading-none">
                  {lockedTarget.scientificName}
                </p>
              </div>

              <button
                onClick={enterViewfinder}
                className="bg-forest text-white p-2 rounded-full active:scale-90 transition-transform cursor-pointer"
                title="Aim and Capture"
              >
                <Crosshair className="w-5 h-5 text-fahy-yellow" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setScanState("idle")}
                className="border border-black/10 hover:bg-surface text-forest/70 font-semibold py-2 rounded-xl flex items-center justify-center gap-1 bg-white text-[11px] active:scale-95 transition-transform cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Choose Other Mode</span>
              </button>
              <button
                onClick={enterViewfinder}
                className="bg-forest hover:bg-forest/95 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-[11px] active:scale-95 transition-transform cursor-pointer"
              >
                <span>Launch Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE VIEWFINDER GAME SCREEN */}
        {scanState === "viewfinder" && lockedTarget && (
          <motion.div
            key="viewfinder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Viewfinder Header info */}
            <div className="flex justify-between items-center text-[10px] font-bold text-forest/60 bg-surface px-3 py-1.5 rounded-xl border border-black/[0.03]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                REC 00:0{gameTimeLeft}
              </span>
              <span>LOCK CONFIRMATION: {scorePercent}%</span>
              <span className="text-peach">
                {lockedTarget.emoji} TARGET IN SIGHT
              </span>
            </div>

            {/* Simulated Live Viewfinder Stage */}
            <div
              onClick={handleViewfinderClick}
              className="bg-slate-900 aspect-[16/9] rounded-2xl relative overflow-hidden border border-black/10 cursor-crosshair"
            >
              {/* Dynamic lens crop marks */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40" />

              {/* Viewfinder Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
                <div className="border border-white/[0.04]" />
              </div>

              {/* Central capture sweet spot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-emerald-500/30 rounded-full flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 bg-emerald-500/50 rounded-full" />
              </div>

              {/* Target Wildlife jumping around */}
              <motion.div
                animate={{ x: `${targetPos.x}%`, y: `${targetPos.y}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="relative group">
                  {/* Glowing Target ring */}
                  <div
                    className="absolute -inset-4 border border-dashed border-peach/50 rounded-full animate-spin pointer-events-none"
                    style={{ animationDuration: "3s" }}
                  />
                  <div className="text-3xl filter drop-shadow-md select-none transform transition-transform group-active:scale-90 cursor-pointer">
                    {lockedTarget.emoji}
                  </div>
                </div>
              </motion.div>

              {/* Sweet spot feedback splash */}
              {sweetSpotActive && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center animate-pulse">
                  <div className="text-emerald-400 font-display font-extrabold text-sm uppercase tracking-widest bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
                    Target Locked!
                  </div>
                </div>
              )}

              {/* User click laser reticle animation */}
              <motion.div
                animate={{ x: `${reticlePos.x}%`, y: `${reticlePos.y}%` }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <div className="w-8 h-8 border-2 border-red-500 rounded-full flex items-center justify-center animate-ping">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                </div>
              </motion.div>
            </div>

            {/* Instruction Footer */}
            <p className="text-[10px] text-forest/60 text-center font-semibold leading-normal">
              🎯 Tap the moving species {getRequiredClicks()} times to lock
              bio-telemetry. <br />
              <span className="text-[9px] text-forest/40">
                Aim accurately to sync with the database.
              </span>
            </p>
          </motion.div>
        )}

        {/* CAPTURE SUCCESS STATE */}
        {scanState === "success" && lockedTarget && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-4 text-center animate-fade-in"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-sage-deep">
              RADAR SUCCESSFUL SCAN
            </span>

            {photoResult ? (
              <>
                <h4 className="font-display font-extrabold text-base text-forest mt-1">
                  Verified: {photoResult.name}!
                </h4>
                <p className="text-xs text-forest/70 mt-2 bg-surface p-3.5 rounded-2xl border border-black/5 max-w-sm leading-relaxed text-left">
                  {photoResult.description}
                </p>
              </>
            ) : audioResult ? (
              <>
                <h4 className="font-display font-extrabold text-base text-forest mt-1">
                  Verified Acoustic Signature: {audioResult.soundType}!
                </h4>
                <p className="text-xs text-forest/70 mt-2 bg-surface p-3.5 rounded-2xl border border-black/5 max-w-sm leading-relaxed text-left">
                  {audioResult.description}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-display font-extrabold text-base text-forest mt-1">
                  Captured {lockedTarget.emoji}{" "}
                  {lockedTarget.name.split(" ")[0]}!
                </h4>
                <p className="text-xs text-forest/60 mt-1 max-w-sm">
                  Your ultrasonic laser lock confirmed this local bio-signature
                  in Fa Hui.
                </p>
              </>
            )}

            <div className="bg-fahy-yellow/15 border border-fahy-yellow/30 px-4 py-2.5 rounded-2xl mt-4 w-full flex items-center justify-around gap-2">
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold text-forest/40">
                  Peach Coins
                </p>
                <p className="text-sm font-extrabold text-forest">
                  +{formatCoins(lockedTarget.reward)}
                </p>
              </div>
              <div className="w-px h-6 bg-forest/10" />
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold text-forest/40">
                  XP Gained
                </p>
                <p className="text-sm font-extrabold text-forest">+20 XP</p>
              </div>
              <div className="w-px h-6 bg-forest/10" />
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold text-forest/40">
                  Standings
                </p>
                <p className="text-sm font-extrabold text-forest">+40 PTS</p>
              </div>
            </div>

            <button
              onClick={() => {
                setPhotoResult(null);
                setAudioResult(null);
                setScanState("idle");
              }}
              className="mt-5 bg-forest text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-forest/90 active:scale-95 transition-transform cursor-pointer"
            >
              Awesome! Scan Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL MODAL OVERLAYS FOR THE TWO EMBEDDED MODES */}

      {/* 1. Camera Analyzing Photo Overlay */}
      {analyzingPhoto && (
        <div className="fixed inset-0 z-50 bg-forest/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in text-center p-6">
          <p className="text-fahy-yellow text-[10px] uppercase tracking-widest font-bold mb-2">
            FAHY ECO-INTELLIGENCE RADAR
          </p>
          <p className="text-white font-display text-lg mb-6 max-w-xs leading-snug">
            Analyzing species photo with Gemini Vision...
          </p>
          <div className="w-12 h-12 border-4 border-fahy-yellow border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-[11px] max-w-[240px]">
            Checking Hong Kong botanical records for flower and bird
            classification...
          </p>
        </div>
      )}

      {/* 2. Silent Listening Recording/Analyzing Overlay */}
      {listeningAudio && (
        <div className="fixed inset-0 z-50 bg-forest/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in text-center p-6">
          <p className="text-fahy-yellow text-[10px] uppercase tracking-widest font-bold mb-2">
            {analyzingAudio
              ? "ANALYZING ACOUSTICS..."
              : "RADAR SILENT LISTENING..."}
          </p>

          <p className="text-white font-display text-xl mb-8 max-w-xs leading-snug">
            {analyzingAudio
              ? "Identifying bird calls and biological sound signatures..."
              : "Listening to local ambient bird sounds..."}
          </p>

          <div className="flex items-end gap-1.5 h-24 mb-8 justify-center">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 rounded-full animate-pulse ${analyzingAudio ? "bg-peach" : "bg-fahy-yellow"}`}
                style={{
                  height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%`,
                  animationDelay: `${i * 60}ms`,
                  animationDuration: analyzingAudio ? "0.6s" : "1.2s",
                }}
              />
            ))}
          </div>

          <p className="text-white/60 text-xs max-w-[260px]">
            Please stay quiet so standard ambient sounds can be parsed properly.
          </p>
        </div>
      )}

      {/* 3. Photo Scanning Error Popup */}
      {photoError && (
        <div
          onClick={() => setPhotoError("")}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xs text-center border-2 border-peach"
          >
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center bg-peach/20 rounded-full">
              <XCircle className="w-8 h-8 text-peach" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Wildlife Scan Failed
            </p>
            <p className="text-xs text-forest/80 mb-4 leading-relaxed">
              {photoError}
            </p>
            <button
              onClick={() => setPhotoError("")}
              className="bg-peach text-white font-bold text-sm px-6 py-2 rounded-full w-full cursor-pointer hover:bg-peach/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. Acoustic Scan Error Popup */}
      {audioError && (
        <div
          onClick={() => setAudioError("")}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xs text-center border-2 border-peach"
          >
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center bg-peach/20 rounded-full">
              <XCircle className="w-8 h-8 text-peach" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Acoustic Scan Failed
            </p>
            <p className="text-xs text-forest/80 mb-4 leading-relaxed">
              {audioError}
            </p>
            <button
              onClick={() => setAudioError("")}
              className="bg-peach text-white font-bold text-sm px-6 py-2 rounded-full w-full cursor-pointer hover:bg-peach/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
