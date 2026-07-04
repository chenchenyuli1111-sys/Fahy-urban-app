import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { useLang, type DictKey } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import {
  Camera,
  MapPin,
  Trash2,
  Sprout,
  AlertTriangle,
  Check,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { analyzeImageFn } from "@/lib/gemini";
import { subscribeToReports, createReport } from "@/lib/firestoreService";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Eco-Debt Reporter — The Fahy Hub" },
      {
        name: "description",
        content: "Report & restore environmental issues in your neighborhood.",
      },
    ],
  }),
  component: Report,
});

const recent: {
  kindKey: DictKey;
  whereKey: DictKey;
  restored: boolean;
  icon: typeof Trash2;
  lat: number;
  lng: number;
}[] = [
  {
    kindKey: "report.cat.trash",
    whereKey: "report.where.heritage",
    restored: true,
    icon: Trash2,
    lat: 22.326,
    lng: 114.172,
  },
  {
    kindKey: "report.cat.decay",
    whereKey: "report.where.lane24",
    restored: false,
    icon: Sprout,
    lat: 22.325,
    lng: 114.173,
  },
  {
    kindKey: "report.cat.trash",
    whereKey: "report.where.west",
    restored: true,
    icon: Trash2,
    lat: 22.324,
    lng: 114.171,
  },
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

function Report() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [verifiedReport, setVerifiedReport] = useState<{
    issueType: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    return subscribeToReports((list) => {
      setReports(list);
    });
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { formatCoins, k } = useLang();
  const { addCoins, addXp } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const now = Date.now();
    const timeDiff = now - file.lastModified;
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES) {
      setErrorMsg(
        "Image rejected: Photo must be taken live to prevent cheating.",
      );
      setSubmitted(false);
      return;
    }

    setUploading(true);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        // Run Gemini Vision Analysis first
        const verification = await analyzeImageFn({
          data: {
            imageBase64: base64String,
            mimeType: file.type,
            mode: "report",
          },
        });

        if (!verification.success) {
          setErrorMsg(
            verification.description ||
              "The image does not appear to show any environmental decay or public park hazard. Please photograph an actual park issue!",
          );
          setUploading(false);
          return;
        }

        // Upload validated file to Storage
        const storageRef = ref(storage, `reports/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await createReport({
          userId: user.uid,
          imageUrl: url,
          status: "verified",
          issueType: verification.issueType,
          description: verification.description,
          lat: 22.3255 + (Math.random() - 0.5) * 0.005,
          lng: 114.1706 + (Math.random() - 0.5) * 0.005,
          restored: false,
        });

        setVerifiedReport({
          issueType: verification.issueType,
          description: verification.description,
        });

        // Award real rewards
        addCoins(50, `Eco-Report: ${verification.issueType}`);
        addXp(40);

        setErrorMsg("");
        setSubmitted(true);
      } catch (err: any) {
        console.error("Capture Analysis Error:", err);
        setErrorMsg("Failed to analyze or upload report: " + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("report.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("report.title")}
        </h1>
      </header>

      <FahyGuide
        level={2}
        message={k("report.guide", { coins: formatCoins(5) })}
      />

      {!hasValidKey && (
        <div className="px-5 mt-4">
          <div className="bg-peach/20 border border-peach p-4 rounded-xl text-xs text-forest">
            <p className="font-bold mb-1">Google Maps API Key Required</p>
            <p>
              To view the interactive map of Fa Hui Park, please add your Google
              Maps API Key to the environment variables.
            </p>
          </div>
        </div>
      )}

      {hasValidKey && (
        <section className="px-5 mt-6 mb-4">
          <div className="h-64 rounded-3xl overflow-hidden border border-black/10 shadow-sm relative">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 22.3255, lng: 114.1724 }} // Fa Hui Park area
                defaultZoom={16}
                mapId="FAHY_REPORT_MAP"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
                disableDefaultUI={true}
              >
                {[
                  ...recent,
                  ...reports.map((r) => ({
                    lat: r.lat,
                    lng: r.lng,
                    restored: r.restored,
                  })),
                ].map((r, i) => (
                  <AdvancedMarker key={i} position={{ lat: r.lat, lng: r.lng }}>
                    <Pin
                      background={r.restored ? "#6BBFA0" : "#FFB7B2"}
                      glyphColor="#fff"
                      borderColor="rgba(0,0,0,0.1)"
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              Fa Hui Park (花墟區域)
            </div>
          </div>
        </section>
      )}

      <section className="px-5 mt-2 relative">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-forest text-white rounded-3xl p-6 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-lg"
        >
          <div className="w-14 h-14 bg-fahy-yellow/20 rounded-2xl grid place-items-center">
            <Camera className="w-7 h-7 text-fahy-yellow" strokeWidth={2.4} />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-xl leading-tight">
              {uploading ? "Uploading..." : "Take Photo to Report"}
            </p>
            <p className="text-[11px] text-white/60 mt-0.5">Live photos only</p>
          </div>
        </button>
      </section>

      <section className="px-5 mt-5">
        <div className="bg-white border border-black/5 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-sage/30 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 22.3255° N
            </span>
            <span className="bg-peach/20 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.trash")}
            </span>
            <span className="bg-fahy-yellow/30 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.decay")}
            </span>
            <span className="bg-slate-100 text-forest/50 text-[10px] font-bold px-2.5 py-1 rounded-full">
              {k("report.cat.other")}
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-8">
        <h2 className="font-display font-bold text-lg mb-4">
          {k("report.recent")}
        </h2>
        <div className="space-y-3">
          {reports.map((r, i) => (
            <div
              key={r.id || i}
              className="bg-white border border-black/5 rounded-2xl p-4 flex items-center gap-3 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-forest/5 relative flex-shrink-0">
                <img
                  src={r.imageUrl}
                  alt={r.issueType}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{r.issueType}</p>
                <p className="text-[10px] text-forest/50 truncate">
                  {r.description}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  r.restored
                    ? "bg-sage-deep text-white"
                    : "bg-fahy-yellow text-forest"
                }`}
              >
                {r.restored
                  ? k("report.status.restored")
                  : k("report.status.review")}
              </span>
            </div>
          ))}

          {recent.map((r, i) => {
            const Icon = r.icon;
            const done = r.restored;
            return (
              <div
                key={`static-${i}`}
                className="bg-white border border-black/5 rounded-2xl p-4 flex items-center gap-3 shadow-xs"
              >
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center ${
                    done
                      ? "bg-sage/30 text-sage-deep"
                      : "bg-peach/20 text-peach"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{k(r.kindKey)}</p>
                  <p className="text-[10px] text-forest/50">{k(r.whereKey)}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    done
                      ? "bg-sage-deep text-white"
                      : "bg-fahy-yellow text-forest"
                  }`}
                >
                  {done
                    ? k("report.status.restored")
                    : k("report.status.review")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {errorMsg && (
        <div
          onClick={() => setErrorMsg("")}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 mx-6 max-w-xs text-center border-2 border-peach">
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center bg-peach/20 rounded-full">
              <XCircle className="w-8 h-8 text-peach" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Validation Failed
            </p>
            <p className="text-xs text-forest/80 mb-4">{errorMsg}</p>
            <button className="bg-peach text-white font-bold text-sm px-6 py-2 rounded-full w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div
          onClick={() => {
            setSubmitted(false);
            setVerifiedReport(null);
          }}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 mx-6 max-w-sm text-center">
            <div className="w-12 h-12 bg-sage/30 text-sage-deep rounded-full grid place-items-center mx-auto mb-3">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg flex items-center justify-center gap-1">
              Report Verified & Submitted!
            </p>

            {verifiedReport && (
              <div className="mt-2 text-left bg-surface p-4 rounded-2xl border border-black/5">
                <p className="font-bold text-sm text-forest mb-1">
                  Issue: {verifiedReport.issueType}
                </p>
                <p className="text-xs text-forest/70 leading-relaxed mb-2">
                  {verifiedReport.description}
                </p>
                <p className="text-xs font-bold text-peach">
                  Reward: +50 Peach Blossom Coins & +40 XP awarded!
                </p>
              </div>
            )}

            <button className="mt-4 bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full w-full">
              Great!
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
