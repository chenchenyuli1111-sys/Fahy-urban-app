import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  subscribeToWorkshops,
  enrollInWorkshop,
  Workshop,
} from "@/lib/firestoreService";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [{ title: "Workshops & Events — The Fahy Hub" }],
  }),
  component: Workshops,
});

function Workshops() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { k } = useLang();
  const { addCoins, addPoints, addXp } = useAppState();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeToWorkshops(
      (workshopsList) => {
        setWorkshops(workshopsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to workshops:", err);
        setError(
          "Failed to fetch upcoming workshops. Please check your network.",
        );
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const handleEnroll = async (id: number, reward: number) => {
    if (!user) return;
    const w = workshops.find((x) => x.id === id);
    if (w && w.spots > 0) {
      await enrollInWorkshop(id, user.uid);
      addCoins(reward, `Enrolled in Workshop: ${w.title}`);
      addPoints(reward * 10);
      addXp(25);
      setShowModal(true);
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest mb-4 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          Community
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          Workshops
        </h1>
        <p className="text-xs text-forest/60 mt-2 font-medium">
          Join local events to learn, connect, and earn coupons.
        </p>
      </header>

      <section className="px-5 mt-4 space-y-4 pb-8">
        {error ? (
          <div className="bg-peach/10 border border-peach/30 rounded-3xl p-6 text-center max-w-sm mx-auto">
            <p className="text-xs text-forest/80 mb-4 font-semibold leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                window.location.reload();
              }}
              className="bg-forest text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-forest/90 active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-6 bg-forest/10 rounded-full w-20" />
                  <div className="h-4 bg-forest/10 rounded-full w-24" />
                </div>
                <div className="h-5 bg-forest/10 rounded-md w-3/4 mb-2" />
                <div className="h-4 bg-forest/5 rounded-md w-1/3 mb-5" />
                <div className="space-y-2.5 mb-6">
                  <div className="h-3.5 bg-forest/10 rounded-md w-2/3" />
                  <div className="h-3.5 bg-forest/10 rounded-md w-1/2" />
                  <div className="h-3.5 bg-forest/10 rounded-md w-1/3" />
                </div>
                <div className="h-11 bg-forest/10 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          workshops.map((w) => {
            const isEnrolled =
              user && w.participants && w.participants.includes(user.uid);
            return (
              <div
                key={w.id}
                className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-sage/20 text-forest text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                    {w.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-peach">
                    <Ticket className="w-3 h-3" /> +{w.reward} Coins
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg mb-1">
                  {w.title}
                </h3>
                <p className="text-xs text-forest/50 font-bold mb-4">
                  by {w.org}
                </p>

                <div className="space-y-2 mb-6">
                  <p className="text-xs flex items-center gap-2 text-forest/70 font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {w.date}
                  </p>
                  <p className="text-xs flex items-center gap-2 text-forest/70 font-semibold">
                    <MapPin className="w-3.5 h-3.5" /> {w.location}
                  </p>
                  <p className="text-xs flex items-center gap-2 text-forest/70 font-semibold">
                    <Users className="w-3.5 h-3.5" /> {w.spots} spots left
                  </p>
                </div>

                <button
                  disabled={isEnrolled || w.spots === 0}
                  onClick={() => handleEnroll(w.id, w.reward)}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-colors active:scale-[0.98] ${
                    isEnrolled
                      ? "bg-forest/5 text-forest/40 cursor-not-allowed"
                      : w.spots === 0
                        ? "bg-forest/5 text-forest/40 cursor-not-allowed"
                        : "bg-forest text-white hover:bg-forest/90"
                  }`}
                >
                  {isEnrolled
                    ? "Enrolled"
                    : w.spots === 0
                      ? "No Spots Left"
                      : "Enroll Now"}
                </button>
              </div>
            );
          })
        )}
      </section>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 mx-6 max-w-xs text-center border-2 border-sage">
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center bg-sage/30 rounded-full text-sage-deep">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Successfully Enrolled!
            </p>
            <p className="text-xs text-forest/80 mb-4">
              You'll earn your coins and a special discount coupon upon
              attending.
            </p>
            <button className="bg-sage-deep text-white font-bold text-sm px-6 py-2 rounded-full w-full">
              Got it
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
