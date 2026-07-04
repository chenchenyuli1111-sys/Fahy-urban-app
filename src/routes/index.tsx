import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CoCreatorStrip } from "@/components/fahy/CoCreatorStrip";
import { PixelFahy } from "@/components/fahy/PixelFahy";
import { AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useAppState } from "@/lib/AppState";
import { AchievementBadge } from "@/components/fahy/AchievementBadge";
import { useState, useEffect } from "react";
import {
  subscribeToMetrics,
  subscribeToWorkshops,
  NeighborhoodMetrics,
  Workshop,
} from "@/lib/firestoreService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Fahy Hub" },
      {
        name: "description",
        content:
          "Live neighborhood pulse, eco-challenges, and rewards — guided by Fahy.",
      },
      { property: "og:title", content: "The Fahy Hub" },
      {
        property: "og:description",
        content:
          "Live neighborhood pulse, eco-challenges, and rewards — guided by Fahy.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { formatCoins, k } = useLang();
  const { coins, level, unlockedBadges, equippedBadge } = useAppState();

  const [metrics, setMetrics] = useState<NeighborhoodMetrics>({
    aqi: 24,
    aqiStatus: "Excellent",
    crowd: "Moderate",
    crowdStatus: "Peaceful",
    noise: "42dB",
    noiseStatus: "Quiet",
  });

  const [featuredWorkshop, setFeaturedWorkshop] = useState<Workshop | null>(
    null,
  );

  useEffect(() => {
    // Subscribe to live neighborhood metrics
    const unsubMetrics = subscribeToMetrics((liveMetrics) => {
      setMetrics(liveMetrics);
    });

    // Subscribe to workshops and grab the first one as featured
    const unsubWorkshops = subscribeToWorkshops((workshopsList) => {
      if (workshopsList.length > 0) {
        setFeaturedWorkshop(workshopsList[0]);
      }
    });

    return () => {
      unsubMetrics();
      unsubWorkshops();
    };
  }, []);

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-6 bg-gradient-to-b from-peach/25 to-transparent relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
              {k("home.district")}
            </p>
            <h1 className="font-display font-bold text-3xl tracking-tight leading-none mt-1">
              {k("app.name")}
            </h1>
            <p className="text-xs font-medium text-forest/60 mt-1">
              {k("home.greeting")}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="relative w-16 h-16 bg-white rounded-2xl shadow-sm border border-peach/30 grid place-items-center active:scale-95 transition-transform"
          >
            {equippedBadge && (
              <AchievementBadge
                badgeKey={equippedBadge}
                size="xs"
                showTooltip={true}
                className="absolute -top-1.5 -left-1.5 z-20 drop-shadow-md pointer-events-none"
              />
            )}
            <PixelFahy level={level} size={56} />
            <div className="absolute -bottom-1 -right-1 bg-fahy-yellow text-[10px] px-1.5 py-0.5 rounded-full font-bold border-2 border-white">
              Lv. {level}
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricTile
            label={k("home.metric.aqi")}
            value={String(metrics.aqi)}
            status={metrics.aqiStatus}
            tone="sage"
          />
          <MetricTile
            label={k("home.metric.crowd")}
            value={metrics.crowd}
            status={metrics.crowdStatus}
            tone="peach"
          />
          <MetricTile
            label={k("home.metric.noise")}
            value={metrics.noise}
            status={metrics.noiseStatus}
            tone="forest"
          />
        </div>
      </header>

      <section className="px-5 mb-8 relative">
        <div className="bg-forest text-white p-5 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-fahy-yellow/90 mb-2">
              {k("home.rec.tag")}
            </p>
            <p className="text-sm leading-relaxed max-w-[230px]">
              {k("home.rec.body")}
            </p>
            <Link
              to="/ecosystem"
              className="inline-block mt-4 bg-fahy-yellow text-forest text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              {k("common.go_now")} · +{formatCoins(10)}
            </Link>
          </div>
          <div className="absolute right-[-30px] top-[-20px] w-36 h-36 bg-fahy-yellow/15 rounded-full" />
          <div className="absolute right-6 bottom-[-20px] w-20 h-20 bg-peach/20 rounded-full" />
        </div>
      </section>

      <section className="px-5 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none">
            {k("home.challenge")}
          </h2>
          <span className="text-[11px] font-semibold text-forest/40">
            {k("home.collected")}
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
          <FeedSpecies
            name={k("home.species.winter_camellia")}
            node="#04"
            state="bloom"
            tone="peach"
          />
          <FeedSpecies
            name={k("home.species.banyan_sparrow")}
            node="#07"
            state="bloom"
            tone="sage"
          />
          <FeedSpecies
            name={k("home.species.locked_name")}
            node={k("home.species.locked_visit")}
            state="locked"
          />
          <FeedSpecies
            name={k("home.species.locked_name")}
            node={k("home.species.locked_scan")}
            state="locked"
          />
        </div>
      </section>

      <section className="px-5 mb-6 relative">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/wallet"
            className="bg-peach/15 border border-peach/30 p-4 rounded-3xl active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 bg-peach/40 rounded-lg grid place-items-center font-bold text-forest">
                桃
              </div>
              <span className="text-[10px] font-bold text-forest/40 tracking-widest">
                {k("home.tile.wallet")}
              </span>
            </div>
            <p className="text-xs text-forest/60">
              {k("home.tile.peach_coins")}
            </p>
            <p className="text-xl font-display font-bold">
              {formatCoins(coins)}
            </p>
          </Link>
          <Link
            to="/culture"
            className="bg-forest p-4 rounded-3xl flex flex-col justify-between active:scale-[0.98] transition-transform min-h-[110px]"
          >
            <div className="flex -space-x-1.5 items-center">
              {unlockedBadges.length > 0 ? (
                <>
                  {unlockedBadges.slice(0, 2).map((bKey) => (
                    <AchievementBadge
                      key={bKey}
                      badgeKey={bKey}
                      size="xs"
                      showTooltip={false}
                      className="ring-2 ring-forest"
                    />
                  ))}
                  {unlockedBadges.length > 2 && (
                    <div className="w-8 h-8 rounded-full bg-fahy-yellow border-2 border-forest text-[9px] flex items-center justify-center font-bold text-forest shadow-md">
                      +{unlockedBadges.length - 2}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AchievementBadge
                    badgeKey="culture.badge.gen_1"
                    size="xs"
                    unlocked={false}
                    showTooltip={false}
                    className="ring-2 ring-forest"
                  />
                  <AchievementBadge
                    badgeKey="culture.badge.gen_0"
                    size="xs"
                    unlocked={false}
                    showTooltip={false}
                    className="ring-2 ring-forest"
                  />
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 text-[9px] flex items-center justify-center font-bold text-white/40">
                    +0
                  </div>
                </>
              )}
            </div>
            <div>
              <p className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">
                {k("home.tile.artisan_path")}
              </p>
              <p className="text-sm text-white font-bold">
                {k("home.tile.badges", { n: unlockedBadges.length })}
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-5 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display font-bold text-lg leading-none">
            Local Workshops
          </h2>
          <Link
            to="/workshops"
            className="text-[11px] font-semibold text-forest/60 underline"
          >
            View all
          </Link>
        </div>
        <div className="bg-white border border-black/5 rounded-3xl p-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-sage-deep uppercase tracking-widest mb-1">
                {featuredWorkshop ? featuredWorkshop.category : "Upcycling Art"}
              </p>
              <p className="text-sm font-bold text-forest">
                {featuredWorkshop
                  ? featuredWorkshop.title
                  : "Plastic Bottle Planters"}
              </p>
            </div>
            <Link
              to="/workshops"
              className="bg-sage/20 text-forest text-xs font-bold px-4 py-2 rounded-full"
            >
              Join
            </Link>
          </div>
        </div>
      </section>

      <CoCreatorStrip />

      <Link
        to="/report"
        className="fixed bottom-24 right-5 z-40 bg-forest text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
      >
        <AlertTriangle className="w-4 h-4 text-fahy-yellow" strokeWidth={2.4} />
        <span className="text-xs font-bold">{k("home.report_btn")}</span>
      </Link>
    </AppShell>
  );
}

function MetricTile({
  label,
  value,
  status,
  tone,
}: {
  label: string;
  value: string;
  status: string;
  tone: "sage" | "peach" | "forest";
}) {
  const accent =
    tone === "sage"
      ? "text-sage-deep"
      : tone === "peach"
        ? "text-peach"
        : "text-forest";
  return (
    <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-xs">
      <span className="block text-[10px] uppercase tracking-wider text-forest/50 font-semibold mb-1">
        {label}
      </span>
      <span className={`text-lg font-display font-bold ${accent}`}>
        {value}
      </span>
      <span className={`text-[9px] block ${accent}/70 opacity-80`}>
        {status}
      </span>
    </div>
  );
}

function FeedSpecies({
  name,
  node,
  state,
  tone,
}: {
  name: string;
  node: string;
  state: "bloom" | "locked";
  tone?: "peach" | "sage";
}) {
  if (state === "locked") {
    return (
      <div className="flex-shrink-0 w-36 bg-white rounded-3xl p-3 border border-black/5 shadow-sm grayscale opacity-60">
        <div className="aspect-square bg-slate-100 rounded-2xl mb-3 grid place-items-center">
          <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-full grid place-items-center text-[10px] font-bold text-slate-400">
            ?
          </div>
        </div>
        <p className="text-xs font-bold">{name}</p>
        <p className="text-[10px] text-forest/50">{node}</p>
      </div>
    );
  }
  // Localized "Bloom" badge + node label come from parent through dictionary.
  const bg = tone === "sage" ? "bg-sage/30" : "bg-peach/25";
  const dot = tone === "sage" ? "bg-sage-deep" : "bg-peach";
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-3xl p-3 border border-black/5 shadow-sm">
      <div
        className={`aspect-square ${bg} rounded-2xl mb-3 relative grid place-items-center`}
      >
        <div className={`w-16 h-16 rounded-full ${dot} opacity-90`} />
        <BloomBadge />
      </div>
      <p className="text-xs font-bold">{name}</p>
      <NodeLabel node={node} />
    </div>
  );
}

function BloomBadge() {
  const { k } = useLang();
  return (
    <div className="absolute top-2 right-2 bg-forest text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
      {k("home.bloom")}
    </div>
  );
}

function NodeLabel({ node }: { node: string }) {
  const { k } = useLang();
  return (
    <p className="text-[10px] text-forest/50">
      {k("home.species.node")} {node}
    </p>
  );
}
