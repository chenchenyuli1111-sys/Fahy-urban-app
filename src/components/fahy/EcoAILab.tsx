import { useState, useRef } from "react";
import {
  Sparkles,
  Camera,
  Video,
  BrainCircuit,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeImageFn, analyzeVideoFn, chatWithFahyFn } from "@/lib/gemini";
import { useAppState } from "@/lib/AppState";

export function EcoAILab() {
  const { addCoins, addPoints, addXp } = useAppState();

  const [activeTab, setActiveTab] = useState<"image" | "video" | "thinking">(
    "image",
  );

  // Image scanning states
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Video scanning states
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoAnalyzing, setVideoAnalyzing] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [videoError, setVideoError] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // High thinking complex prompt states
  const [thinkingQuery, setThinkingQuery] = useState("");
  const [thinkingAnalyzing, setThinkingAnalyzing] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [thinkingSources, setThinkingSources] = useState<any[]>([]);
  const [thinkingError, setThinkingError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");
    setImageResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async () => {
    if (!imagePreview) return;

    setImageAnalyzing(true);
    setImageError("");

    try {
      const base64Data = imagePreview.split(",")[1];
      const result = await analyzeImageFn({
        data: {
          imageBase64: base64Data,
          mimeType: "image/jpeg",
          mode: "species",
        },
      });

      if (result.success) {
        setImageResult({
          name: result.name,
          description: result.description,
          coins: result.coins || 50,
        });
        addCoins(
          result.coins || 50,
          `Eco-Lab Advanced Photo Scan: ${result.name}`,
        );
        addPoints(60);
        addXp(40);
      } else {
        setImageError(
          result.description ||
            "The advanced image scanner was unable to verify this as a valid biodiversity species. Make sure the flora/fauna is clearly visible.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setImageError(
        "Analysis failed: " + (err.message || "Unknown error occurred"),
      );
    } finally {
      setImageAnalyzing(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setVideoError(
        "Video file is too large. Please upload a clip under 15MB.",
      );
      return;
    }

    setVideoError("");
    setVideoResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runVideoAnalysis = async () => {
    if (!videoPreview) return;

    setVideoAnalyzing(true);
    setVideoError("");

    try {
      const base64Data = videoPreview.split(",")[1];
      const mimeType = videoPreview.split(";")[0].split(":")[1] || "video/mp4";

      const result = await analyzeVideoFn({
        data: {
          videoBase64: base64Data,
          mimeType,
        },
      });

      if (result.success !== false) {
        setVideoResult({
          title: result.title || "Advanced Bio-Monitoring Video Analysis",
          keyFindings: result.keyFindings || [],
          recommendation: result.recommendation || "Maintain natural state.",
        });
        addCoins(
          100,
          `Eco-Lab Advanced Video Analysis: ${result.title || "Bio Video"}`,
        );
        addPoints(100);
        addXp(60);
      } else {
        setVideoError(
          result.recommendation ||
            "Could not successfully analyze video frames.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setVideoError(
        "Video parsing failed: " + (err.message || "Unknown error occurred"),
      );
    } finally {
      setVideoAnalyzing(false);
    }
  };

  const runThinkingQuery = async () => {
    if (!thinkingQuery.trim()) return;

    setThinkingAnalyzing(true);
    setThinkingError("");
    setThinkingResult(null);
    setThinkingSources([]);

    try {
      const chatMessages = [
        {
          role: "user" as const,
          content:
            "This is an advanced ecological research query from the Fa Hui Eco-AI Lab. Please perform a deep, comprehensive breakdown:\n\n" +
            thinkingQuery,
        },
      ];

      const result = await chatWithFahyFn({
        data: {
          messages: chatMessages,
          highThinking: true,
        },
      });

      if (result.response) {
        setThinkingResult(result.response);
        setThinkingSources(result.sources || []);
        addCoins(30, "Complex High Thinking Deep Research query");
        addPoints(30);
      } else {
        setThinkingError("Failed to elicit a structured deep response.");
      }
    } catch (err: any) {
      console.error(err);
      setThinkingError(
        "Thinking process failed: " + (err.message || "Unknown error"),
      );
    } finally {
      setThinkingAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] border-4 border-[#1C3226]/10 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-emerald-100 text-forest rounded-2xl">
          <BrainCircuit className="w-5 h-5 text-forest animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-base text-forest">
            Fa Hui Eco-AI Laboratory
          </h3>
          <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-700/60 font-semibold">
            Premium Gemini 3.1 Pro Intelligence
          </p>
        </div>
      </div>

      {/* Lab Mode Tabs */}
      <div className="flex border-b border-black/5 mb-6 text-xs font-bold p-0.5 bg-white/60 backdrop-blur rounded-full">
        <button
          onClick={() => setActiveTab("image")}
          className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === "image"
              ? "bg-forest text-white shadow-xs"
              : "text-forest/60 hover:text-forest"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Image Vision</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === "video"
              ? "bg-forest text-white shadow-xs"
              : "text-forest/60 hover:text-forest"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("thinking")}
          className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === "thinking"
              ? "bg-forest text-white shadow-xs"
              : "text-forest/60 hover:text-forest"
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>Deep Reasoning</span>
        </button>
      </div>

      {/* Tabs Content */}
      <AnimatePresence mode="wait">
        {activeTab === "image" && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-xs text-forest/70 leading-relaxed">
              Upload species photos for professional botanical identification,
              health assessment, and ecological tips.
            </p>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-forest/20 rounded-2xl p-8 text-center bg-white hover:bg-forest/[0.02] cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 bg-forest/5 rounded-full text-forest mb-1">
                  <Upload className="w-6 h-6 text-forest" />
                </div>
                <span className="font-bold text-xs text-forest">
                  Upload Biodiversity Photo
                </span>
                <span className="text-[10px] text-forest/50">
                  Supports JPG, PNG, WEBP
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageResult(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 text-xs font-bold"
                  >
                    Change
                  </button>
                </div>

                {!imageResult && !imageAnalyzing && (
                  <button
                    onClick={runImageAnalysis}
                    className="w-full bg-forest text-white font-bold text-xs py-3 rounded-full hover:bg-forest/95 active:scale-98 transition-transform cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Run Professional Analysis
                  </button>
                )}
              </div>
            )}

            {imageAnalyzing && (
              <div className="p-6 bg-white border border-forest/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
                <span className="font-bold text-xs text-forest">
                  Scanning Botanical Records...
                </span>
                <span className="text-[10px] text-forest/50">
                  Gemini Pro executing deep vision taxonomy...
                </span>
              </div>
            )}

            {imageError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{imageError}</span>
              </div>
            )}

            {imageResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-forest/10 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Taxon Verification Approved
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    ✨ +{imageResult.coins} Coins
                  </span>
                </div>
                <h4 className="font-display font-extrabold text-sm text-forest">
                  {imageResult.name}
                </h4>
                <p className="text-xs text-forest/70 leading-relaxed">
                  {imageResult.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Added species bio-telemetry to local Fa Hui registry!
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-xs text-forest/70 leading-relaxed">
              Upload eco-monitoring, bird flights, or plant coverage videos.
              Gemini Pro reads consecutive frames to diagnose wildlife behavior
              and park health.
            </p>

            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />

            {!videoPreview ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-forest/20 rounded-2xl p-8 text-center bg-white hover:bg-forest/[0.02] cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 bg-forest/5 rounded-full text-forest mb-1">
                  <Upload className="w-6 h-6 text-forest animate-bounce" />
                </div>
                <span className="font-bold text-xs text-forest">
                  Upload Eco-Monitoring Video
                </span>
                <span className="text-[10px] text-forest/50">
                  Supports MP4, MOV, WEBM (Max 15MB)
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <button
                    onClick={() => {
                      setVideoPreview(null);
                      setVideoResult(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 text-xs font-bold"
                  >
                    Change
                  </button>
                </div>

                {!videoResult && !videoAnalyzing && (
                  <button
                    onClick={runVideoAnalysis}
                    className="w-full bg-forest text-white font-bold text-xs py-3 rounded-full hover:bg-forest/95 active:scale-98 transition-transform cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Run Video Frame Analytics
                  </button>
                )}
              </div>
            )}

            {videoAnalyzing && (
              <div className="p-6 bg-white border border-forest/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
                <span className="font-bold text-xs text-forest">
                  Decoding Video Frames...
                </span>
                <span className="text-[10px] text-forest/50">
                  Gemini Pro mapping sequential spatial observations...
                </span>
              </div>
            )}

            {videoError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{videoError}</span>
              </div>
            )}

            {videoResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-forest/10 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Spatial Sequence Verified
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    ✨ +100 Coins
                  </span>
                </div>
                <h4 className="font-display font-extrabold text-sm text-forest">
                  {videoResult.title}
                </h4>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-forest/50 uppercase tracking-wider">
                    Key Spatial Observations:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-forest/70 space-y-1">
                    {videoResult.keyFindings.map(
                      (finding: string, idx: number) => (
                        <li key={idx}>{finding}</li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="border-t border-black/5 pt-2 mt-2">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Maintenance
                    Recommendation:
                  </p>
                  <p className="text-xs text-forest/80 italic mt-1 leading-relaxed">
                    "{videoResult.recommendation}"
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-xs text-forest/70 leading-relaxed">
              Ask highly complex urban forestry questions, local biodiversity
              preservation inquiries, or design park conservation challenges.
              Gemini Pro uses deep self-correction/thinking to formulate the
              answer.
            </p>

            <div className="space-y-2">
              <textarea
                placeholder="e.g., Explain how Mong Kok's high humidity and concrete density affects the growth patterns of Banyan trees in Fa Hui Park, and suggest 3 sustainable soil ventilation remedies."
                value={thinkingQuery}
                onChange={(e) => setThinkingQuery(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-2xl p-3 text-xs min-h-[100px] text-forest placeholder-forest/30 focus:outline-none focus:ring-2 focus:ring-forest/30"
              />

              <button
                onClick={runThinkingQuery}
                disabled={thinkingAnalyzing || !thinkingQuery.trim()}
                className="w-full bg-forest text-white font-bold text-xs py-3 rounded-full hover:bg-forest/95 active:scale-98 transition-transform disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />{" "}
                Run Deep Reasoning Sequence
              </button>
            </div>

            {thinkingAnalyzing && (
              <div className="p-6 bg-white border border-forest/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex gap-1.5 justify-center items-center h-8">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                </div>
                <span className="font-bold text-xs text-orange-500 flex items-center gap-1 animate-pulse">
                  <BrainCircuit className="w-4 h-4 text-orange-400" /> THINKING
                  PROCESS RUNNING...
                </span>
                <span className="text-[10px] text-forest/50 max-w-xs leading-normal">
                  Gemini 3.1 Pro-Preview is analyzing system bounds, verifying
                  botanical logic chains, and generating comprehensive
                  explanations.
                </span>
              </div>
            )}

            {thinkingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{thinkingError}</span>
              </div>
            )}

            {thinkingResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-forest/10 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-black/5 pb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-500" /> Deep Reasoned
                    Response
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    ✨ +30 Coins
                  </span>
                </div>

                <div className="text-xs text-forest/80 leading-relaxed whitespace-pre-wrap space-y-3 font-sans">
                  {thinkingResult}
                </div>

                {thinkingSources.length > 0 && (
                  <div className="border-t border-black/5 pt-3 mt-3">
                    <p className="text-[10px] font-bold text-forest/50 uppercase tracking-wider mb-2">
                      Retrieved Grounding Sources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {thinkingSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-forest/70 font-semibold px-2 py-1 rounded-md flex items-center gap-1 transition-colors border border-black/[0.03]"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
