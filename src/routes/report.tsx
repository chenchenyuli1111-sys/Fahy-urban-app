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

  // Map & Location Tracking States
  const [clickedLatLng, setClickedLatLng] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 22.3255,
    lng: 114.1724,
  });
  const [mapZoom, setMapZoom] = useState<number>(16);

  // Form states for Pin Report
  const [customIssueType, setCustomIssueType] = useState("Litter & Trash");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setClickedLatLng({ lat, lng });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setMapCenter({ lat, lng });
          setMapZoom(17);
        },
        (err) => {
          console.error("Geolocation failed:", err);
          setErrorMsg(
            "Could not retrieve geolocation. Please check browser permissions.",
          );
        },
      );
    } else {
      setErrorMsg("Geolocation is not supported by your browser.");
    }
  };

  const zoomIn = () => setMapZoom((z) => Math.min(20, z + 1));
  const zoomOut = () => setMapZoom((z) => Math.max(10, z - 1));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCustomPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!clickedLatLng) {
      setErrorMsg(
        "Please tap/click on the Google Map to set the precise location first!",
      );
      return;
    }
    if (!customDescription.trim()) {
      setErrorMsg("Please provide a short description of the problem.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      let url = "";
      let finalIssueType = customIssueType;

      if (selectedPhoto) {
        // Run Gemini Vision API verification first!
        const reader = new FileReader();
        const readPromise = new Promise<string>((resolve) => {
          reader.onloadend = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(selectedPhoto);
        });
        const base64String = await readPromise;

        const verification = await analyzeImageFn({
          data: {
            imageBase64: base64String,
            mimeType: selectedPhoto.type,
            mode: "report",
          },
        });

        if (!verification.success) {
          setErrorMsg(
            verification.description ||
              "The photo does not seem to contain a public park hazard or eco issue. Please try another photo!",
          );
          setUploading(false);
          return;
        }

        // Upload validated file to Storage
        const storageRef = ref(storage, `reports/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, selectedPhoto);
        url = await getDownloadURL(storageRef);
        finalIssueType = verification.issueType;
      } else {
        // Fallback default placeholder
        url =
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
      }

      // Save to Firestore!
      await createReport({
        userId: user.uid,
        imageUrl: url,
        status: "verified",
        issueType: finalIssueType,
        description: customDescription,
        lat: clickedLatLng.lat,
        lng: clickedLatLng.lng,
        restored: false,
      });

      setVerifiedReport({
        issueType: finalIssueType,
        description: customDescription,
      });

      // Award real coins and XP
      addCoins(50, `Eco-Pin: ${finalIssueType}`);
      addXp(40);

      // Reset states
      setClickedLatLng(null);
      setCustomDescription("");
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setErrorMsg("");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Custom Pin Submission Error:", err);
      setErrorMsg("Failed to submit custom report pin: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleShareReport = (r: any) => {
    const textToCopy = `📍 Fa Hui Park Community Hazard:\n⚠️ Category: ${r.issueType}\n📝 Status: Under Review\n💬 Details: ${r.description}\n🗺️ Coordinates: ${r.lat.toFixed(4)}°, ${r.lng.toFixed(4)}°\nHelp us clean up!`;
    navigator.clipboard.writeText(textToCopy);
    alert(
      "Report information copied to clipboard! Share it with the community.",
    );
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
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
          <div className="h-72 rounded-3xl overflow-hidden border border-black/10 shadow-sm relative">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                center={mapCenter}
                zoom={mapZoom}
                onCenterChanged={(ev) => {
                  if (ev.detail.center) setMapCenter(ev.detail.center);
                }}
                onZoomChanged={(ev) => {
                  if (typeof ev.detail.zoom === "number")
                    setMapZoom(ev.detail.zoom);
                }}
                onClick={handleMapClick}
                mapId="FAHY_REPORT_MAP"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
                disableDefaultUI={true}
              >
                {/* User Current Geolocation Pin */}
                {userLocation && (
                  <AdvancedMarker position={userLocation}>
                    <div className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 border border-white"></span>
                    </div>
                  </AdvancedMarker>
                )}

                {/* Clicked Draft Pin */}
                {clickedLatLng && (
                  <AdvancedMarker position={clickedLatLng}>
                    <Pin
                      background="#FF5449"
                      glyphColor="#fff"
                      borderColor="#930006"
                    />
                  </AdvancedMarker>
                )}

                {/* Existing Database and Static Pins */}
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

            {/* Controls overlay */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-extrabold shadow-sm border border-black/[0.03] text-forest">
              📍 Tap map to set pin location
            </div>

            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
              <button
                onClick={handleLocateMe}
                className="bg-white hover:bg-slate-50 text-forest p-2 rounded-full shadow-md border border-black/5 active:scale-90 transition-transform cursor-pointer"
                title="Find my location"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
              </button>
              <div className="bg-white rounded-full shadow-md border border-black/5 flex flex-col overflow-hidden">
                <button
                  onClick={zoomIn}
                  className="p-2 hover:bg-slate-50 text-forest font-extrabold text-xs border-b border-black/[0.03] text-center cursor-pointer"
                  title="Zoom In"
                >
                  ＋
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 hover:bg-slate-50 text-forest font-extrabold text-xs text-center cursor-pointer"
                  title="Zoom Out"
                >
                  －
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Pin Report Form */}
      <section className="px-5 mt-3">
        <form
          onSubmit={handleSubmitCustomPin}
          className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-black/[0.03] pb-2.5">
            <div className="w-8 h-8 rounded-full bg-peach/10 text-peach flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-forest">
                Report Park Issue
              </h3>
              <p className="text-[9px] text-forest/40 font-bold">
                {clickedLatLng
                  ? `Dropped pin: ${clickedLatLng.lat.toFixed(4)}°, ${clickedLatLng.lng.toFixed(4)}°`
                  : "Tap on the map above to set precise coordinates"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
              Issue Category
            </label>
            <select
              value={customIssueType}
              onChange={(e) => setCustomIssueType(e.target.value)}
              className="w-full bg-surface border border-black/5 rounded-xl px-3 py-2 text-xs font-bold text-forest focus:outline-none focus:border-forest/30"
            >
              <option value="Litter & Trash">
                Litter & Overflowing Trash 🪰
              </option>
              <option value="Plant & Canopy Decay">
                Botanical / Plant Decay 🍂
              </option>
              <option value="Broken Facilities">
                Broken Facilities / Lights ⚙️
              </option>
              <option value="Public Safety Hazard">
                Public Safety / Hazard ⚠️
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
              Description
            </label>
            <textarea
              placeholder="e.g. Overflowing garbage container next to the botanical greenhouse."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-surface border border-black/5 rounded-xl p-3 text-xs font-semibold text-forest focus:outline-none focus:border-forest/30 h-20 resize-none leading-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
              Optional Verification Photo
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface hover:bg-forest/5 border border-black/5 rounded-xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-forest cursor-pointer transition-colors shrink-0"
              >
                <Camera className="w-4 h-4 text-forest/60" />
                <span>{selectedPhoto ? "Change Photo" : "Upload Photo"}</span>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {photoPreview ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/5 relative shrink-0">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-[9px] text-forest/40 font-semibold leading-snug">
                  *AI validates photos of trash/decay for authentic coins
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-forest text-white rounded-2xl py-3 text-xs font-bold shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {uploading ? (
              <span>Uploading & AI-Verifying...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Submit & Share Eco-Report Pin</span>
              </>
            )}
          </button>
        </form>
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleShareReport(r)}
                  className="bg-forest/5 hover:bg-forest/10 px-2.5 py-1 rounded-full text-forest text-[9px] font-extrabold transition-colors cursor-pointer active:scale-95"
                >
                  🔗 Share
                </button>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
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
