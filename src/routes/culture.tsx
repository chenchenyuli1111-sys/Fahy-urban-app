import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { FahyGuide } from "@/components/fahy/FahyGuide";
import { useLang, type DictKey } from "@/lib/i18n";
import {
  MapPin,
  Play,
  Lock,
  ScanLine,
  XCircle,
  Check,
  Loader2,
  Award,
  Share2,
  Crown,
  Compass,
  Eye,
  Volume2,
  ShieldAlert,
} from "lucide-react";
import { doc, updateDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useAppState } from "@/lib/AppState";
import { verifyArtisanSignFn } from "@/lib/gemini";
import { AchievementBadge } from "@/components/fahy/AchievementBadge";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Artisan Path — The Fahy Hub" },
      {
        name: "description",
        content:
          "Collect badges from local artisans and unlock oral histories.",
      },
    ],
  }),
  component: Culture,
});

interface BadgeDefinition {
  key: string;
  name: string;
  emoji: string;
  level: "I" | "II" | "III";
  rarity: string;
  description: string;
  requirement: string;
  levelRequired?: number;
  pointsRequired?: number;
}

interface TrackDefinition {
  id: string;
  title: string;
  color: string; // Tailwind hex color
  ribbonColor: string; // Tailwind hex/bg color
  accentText: string;
  badges: BadgeDefinition[];
}

const BADGE_TRACKS: TrackDefinition[] = [
  {
    id: "onboarding",
    title: "Onboarding",
    color: "#F59E0B", // Amber
    ribbonColor: "#D97706",
    accentText: "text-amber-600",
    badges: [
      {
        key: "culture.badge.gen_1",
        name: "Community Novice",
        emoji: "🏡",
        level: "I",
        rarity: "Common",
        description: "Welcome to the Fa Hui neighborhood community!",
        requirement: "Complete initial onboarding to Fahy.",
      },
      {
        key: "culture.badge.gen_2",
        name: "Active Resident",
        emoji: "🌱",
        level: "II",
        rarity: "Uncommon",
        description:
          "A friendly neighbor who actively participates in community events.",
        requirement: "Reach profile level 2 or higher.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_3",
        name: "Heritage Guardian",
        emoji: "🎖️",
        level: "III",
        rarity: "Rare",
        description:
          "A pillar of the local community protecting cultural stories.",
        requirement: "Reach profile level 4 or higher.",
        levelRequired: 4,
      },
    ],
  },
  {
    id: "tea",
    title: "Tea Art (茶)",
    color: "#10B981", // Emerald
    ribbonColor: "#059669",
    accentText: "text-emerald-600",
    badges: [
      {
        key: "culture.badge.gen_0",
        name: "Tea Apprentice",
        emoji: "🍵",
        level: "I",
        rarity: "Common",
        description: "Beginner learning the way of Fa Hui local tea leaves.",
        requirement: "Visit & Scan Lin's Tea House.",
      },
      {
        key: "culture.badge.gen_11",
        name: "Brewing Adept",
        emoji: "🍂",
        level: "II",
        rarity: "Uncommon",
        description: "Master of temperatures, steeping times, and clay pots.",
        requirement: "Unlock Tea Apprentice + Reach level 2 Profile.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_12",
        name: "Tea Grandmaster",
        emoji: "👑",
        level: "III",
        rarity: "Legendary",
        description:
          "An honored sommelier of traditional Chinese brewing arts.",
        requirement: "Unlock Brewing Adept + Reach level 4 Profile.",
        levelRequired: 4,
      },
    ],
  },
  {
    id: "indigo",
    title: "Indigo Dye (藍)",
    color: "#4F46E5", // Indigo
    ribbonColor: "#3730A3",
    accentText: "text-indigo-600",
    badges: [
      {
        key: "culture.badge.gen_10",
        name: "Indigo Starter",
        emoji: "👕",
        level: "I",
        rarity: "Common",
        description:
          "Your first deep immersion into organic plant fermentation dyes.",
        requirement: "Visit & Scan Old Town Indigo.",
      },
      {
        key: "culture.badge.gen_21",
        name: "Indigo Artisan",
        emoji: "🌀",
        level: "II",
        rarity: "Uncommon",
        description:
          "Experienced dye practitioner crafting intricate tie-dye resist patterns.",
        requirement: "Unlock Indigo Starter + Reach level 2 Profile.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_22",
        name: "Master of Blue",
        emoji: "🔮",
        level: "III",
        rarity: "Legendary",
        description:
          "Preserving ancient deep-indigo shades through flawless craftsmanship.",
        requirement: "Unlock Indigo Artisan + Reach level 4 Profile.",
        levelRequired: 4,
      },
    ],
  },
  {
    id: "bamboo",
    title: "Bamboo Craft (竹)",
    color: "#22C55E", // Green
    ribbonColor: "#15803D",
    accentText: "text-forest",
    badges: [
      {
        key: "culture.badge.gen_20",
        name: "Weaving Pupil",
        emoji: "🎋",
        level: "I",
        rarity: "Common",
        description:
          "Learning the delicate split-bamboo techniques of the elders.",
        requirement: "Visit & Scan Bamboo & Co.",
      },
      {
        key: "culture.badge.gen_31",
        name: "Basket Crafter",
        emoji: "🧺",
        level: "II",
        rarity: "Uncommon",
        description:
          "Able to bind and form elegant 3D load-bearing utility baskets.",
        requirement: "Unlock Weaving Pupil + Reach level 2 Profile.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_32",
        name: "Bamboo Sovereign",
        emoji: "🏰",
        level: "III",
        rarity: "Legendary",
        description:
          "Crafting architectural bamboo works and premium custom furniture.",
        requirement: "Unlock Basket Crafter + Reach level 4 Profile.",
        levelRequired: 4,
      },
    ],
  },
  {
    id: "paper",
    title: "Paper Craft (紙)",
    color: "#EC4899", // Pink
    ribbonColor: "#BE185D",
    accentText: "text-pink-600",
    badges: [
      {
        key: "culture.badge.gen_30",
        name: "Paper Folder",
        emoji: "🪁",
        level: "I",
        rarity: "Common",
        description: "Learning bamboo-skeleton backing and fine paper folds.",
        requirement: "Visit & Scan Hui Paper Crafts.",
      },
      {
        key: "culture.badge.gen_41",
        name: "Kite Designer",
        emoji: "🕊️",
        level: "II",
        rarity: "Uncommon",
        description: "Building fully flyable traditional wind kites.",
        requirement: "Unlock Paper Folder + Reach level 2 Profile.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_42",
        name: "Paper Sculptor",
        emoji: "🐉",
        level: "III",
        rarity: "Legendary",
        description:
          "Crafting complex multi-tiered paper dragons for festivals.",
        requirement: "Unlock Kite Designer + Reach level 4 Profile.",
        levelRequired: 4,
      },
    ],
  },
  {
    id: "lantern",
    title: "Lantern Art (燈)",
    color: "#EF4444", // Red
    ribbonColor: "#B91C1C",
    accentText: "text-red-600",
    badges: [
      {
        key: "culture.badge.gen_70",
        name: "Lantern Builder",
        emoji: "🏮",
        level: "I",
        rarity: "Common",
        description: "Hand-assembling standard celebratory festival lanterns.",
        requirement: "Visit & Scan Shing Kee Lanterns.",
      },
      {
        key: "culture.badge.gen_71",
        name: "Glow Artisan",
        emoji: "💡",
        level: "II",
        rarity: "Uncommon",
        description:
          "Integrating delicate illumination and calligraphic paintings.",
        requirement: "Unlock Lantern Builder + Reach level 2 Profile.",
        levelRequired: 2,
      },
      {
        key: "culture.badge.gen_72",
        name: "Lantern Sovereign",
        emoji: "🎆",
        level: "III",
        rarity: "Legendary",
        description:
          "Acclaimed lantern designer lighting up city-wide celebrations.",
        requirement: "Unlock Glow Artisan + Reach level 4 Profile.",
        levelRequired: 4,
      },
    ],
  },
];

interface Artisan {
  id: string; // 'tea', 'indigo', 'bamboo', 'paper', 'lantern'
  name: string; // 'Lin\'s Tea House'
  master: string; // 'Master Lin'
  distance: string; // '120m'
  badgeKey: string; // 'culture.badge.gen_0'
  certName: string; // 'Tea Master Certification'
  oralHistoryTitle: string; // 'Lin\'s 40 Years of Tea'
  oralHistoryMeta: string; // '2:14'
  oralHistoryDesc: string; // 'Listen to Master Lin describe the changing alleys of Fa Hui through the steam of clay oolong pots.'
  gradient: string; // 'from-emerald-400 to-teal-500'
  aiCategory: string; // 'Tea Master', 'Indigo Artisan', 'Bamboo Weaver', 'Paper Crafter', 'Lantern Maker'
}

const ARTISANS_DATA: Artisan[] = [
  {
    id: "tea",
    name: "Lin's Tea House",
    master: "Master Lin",
    distance: "120m",
    badgeKey: "culture.badge.gen_0",
    certName: "Tea Master Certification",
    oralHistoryTitle: "Lin's 40 Years of Tea",
    oralHistoryMeta: "2:14",
    oralHistoryDesc:
      "Listen to Master Lin describe the changing alleys of Fa Hui through the steam of clay oolong pots.",
    gradient: "from-emerald-400 to-teal-500",
    aiCategory: "Tea Master",
  },
  {
    id: "indigo",
    name: "Old Town Indigo",
    master: "Master Chen",
    distance: "340m",
    badgeKey: "culture.badge.gen_10",
    certName: "Indigo Dye Certification",
    oralHistoryTitle: "Indigo at Midnight",
    oralHistoryMeta: "3:45",
    oralHistoryDesc:
      "How natural flora indigo drapes the neighborhood stories in shades of midnight blue.",
    gradient: "from-indigo-400 to-blue-600",
    aiCategory: "Indigo Artisan",
  },
  {
    id: "bamboo",
    name: "Bamboo & Co.",
    master: "Master Wong",
    distance: "510m",
    badgeKey: "culture.badge.gen_20",
    certName: "Bamboo Craft Certification",
    oralHistoryTitle: "Bending of the Bamboo",
    oralHistoryMeta: "1:58",
    oralHistoryDesc:
      "The rhythmic click of split bamboo weaving. Sound preservation of active street crafts.",
    gradient: "from-green-400 to-emerald-600",
    aiCategory: "Bamboo Weaver",
  },
  {
    id: "paper",
    name: "Hui Paper Crafts",
    master: "Master Zhang",
    distance: "680m",
    badgeKey: "culture.badge.gen_30",
    certName: "Paper Craft Certification",
    oralHistoryTitle: "Paper, Wind, and Spirit",
    oralHistoryMeta: "4:12",
    oralHistoryDesc:
      "Stories of wind kite creation and traditional paper-dragon engineering.",
    gradient: "from-pink-400 to-rose-500",
    aiCategory: "Paper Crafter",
  },
  {
    id: "lantern",
    name: "Shing Kee Lanterns",
    master: "Master Ma",
    distance: "820m",
    badgeKey: "culture.badge.gen_70",
    certName: "Lantern Art Certification",
    oralHistoryTitle: "Lighting the Alleyways",
    oralHistoryMeta: "2:50",
    oralHistoryDesc:
      "Memories of Mid-Autumn celebrations with grand hand-built street lanterns.",
    gradient: "from-red-400 to-orange-500",
    aiCategory: "Lantern Maker",
  },
];

function ScallopedBadge({
  emoji,
  color,
  ribbonColor,
  unlocked = false,
  equipped = false,
  level = "I",
  trackId = "",
  onClick,
}: {
  emoji: string;
  color?: string;
  ribbonColor?: string;
  unlocked?: boolean;
  equipped?: boolean;
  level?: "I" | "II" | "III";
  trackId?: string;
  onClick?: () => void;
}) {
  return (
    <AchievementBadge
      emoji={emoji}
      color={color}
      ribbonColor={ribbonColor}
      unlocked={unlocked}
      equipped={equipped}
      level={level}
      showRibbons={true}
      showTooltip={false}
      isOnboarding={trackId === "onboarding"}
      onClick={onClick}
    />
  );
}

function Culture() {
  const { user } = useAuth();
  const { addCoins, addPoints, addXp, level } = useAppState();
  const { k } = useLang();

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [equippedBadge, setEquippedBadge] = useState<string>("");
  const [activeArtisan, setActiveArtisan] = useState<Artisan | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(
    null,
  );
  const [selectedTrack, setSelectedTrack] = useState<TrackDefinition | null>(
    null,
  );
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUnlockedBadges(data.badges || []);
        setEquippedBadge(data.equippedBadge || "");
      }
    });
    return unsub;
  }, [user]);

  // Give the Community Novice (gen_1) badge for opening the page if they don't have it
  useEffect(() => {
    if (!user) return;
    if (
      unlockedBadges.length > 0 &&
      !unlockedBadges.includes("culture.badge.gen_1")
    ) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        badges: arrayUnion("culture.badge.gen_1"),
      });
    }
  }, [user, unlockedBadges]);

  const handleEquip = async (badgeKey: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { equippedBadge: badgeKey });
    setEquippedBadge(badgeKey);
  };

  const handleClaimBadge = async (badge: BadgeDefinition) => {
    if (!user || unlockedBadges.includes(badge.key)) return;

    // Requirements validation
    if (badge.levelRequired && level < badge.levelRequired) return;

    // Check pre-requisite for artisan levels
    if (badge.level === "II") {
      const track = BADGE_TRACKS.find((t) =>
        t.badges.some((b) => b.key === badge.key),
      );
      if (track && !unlockedBadges.includes(track.badges[0].key)) {
        setErrorMsg(
          "You must unlock Level I (Apprentice) first before claiming this badge.",
        );
        return;
      }
    } else if (badge.level === "III") {
      const track = BADGE_TRACKS.find((t) =>
        t.badges.some((b) => b.key === badge.key),
      );
      if (track && !unlockedBadges.includes(track.badges[1].key)) {
        setErrorMsg(
          "You must unlock Level II (Adept/Artisan) first before claiming this badge.",
        );
        return;
      }
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        badges: arrayUnion(badge.key),
      });

      // Award prizes based on level
      const coinsReward =
        badge.level === "III" ? 250 : badge.level === "II" ? 100 : 50;
      const pointsReward =
        badge.level === "III" ? 2500 : badge.level === "II" ? 1000 : 500;
      const xpReward =
        badge.level === "III" ? 100 : badge.level === "II" ? 50 : 25;

      addCoins(coinsReward, `Claimed Badge: ${badge.name}`);
      addPoints(pointsReward);
      addXp(xpReward);

      setFeedback(
        `Congratulations! You have claimed your ${badge.level} Badge: ${badge.name}! You earned +${coinsReward} Coins, +${pointsReward} Points, and +${xpReward} XP.`,
      );
      setSuccess(true);
      setSelectedBadge(null);
    } catch (err) {
      const errorStr = err instanceof Error ? err.message : String(err);
      setErrorMsg("Failed to claim badge: " + errorStr);
    }
  };

  const unlockArtisan = async (badgeKey: string, artisanName: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        badges: arrayUnion(badgeKey),
      });

      addCoins(50, `Unlocked Badge: ${artisanName}`);
      addPoints(50);
      addXp(30);

      setFeedback(
        `Congratulations! You have unlocked the ${artisanName} badge! You earned +50 Coins, +50 Points, and +30 XP.`,
      );
      setSuccess(true);
    } catch (err) {
      const errorStr = err instanceof Error ? err.message : String(err);
      setErrorMsg("Failed to unlock artisan badge: " + errorStr);
    }
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeArtisan || !user) return;

    // Validate photo timestamp (must be taken live to prevent cheating)
    const now = Date.now();
    const timeDiff = now - file.lastModified;
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES) {
      setErrorMsg(
        "Image rejected: Photo must be taken live to prevent cheating.",
      );
      setSuccess(false);
      return;
    }

    setAnalyzing(true);
    setErrorMsg("");
    setSuccess(false);

    const category = activeArtisan.aiCategory;
    const badgeToUnlock = activeArtisan.badgeKey;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const result = await verifyArtisanSignFn({
          data: {
            imageBase64: base64String,
            mimeType: file.type,
            category,
          },
        });

        setAnalyzing(false);
        if (result.success) {
          await unlockArtisan(badgeToUnlock, activeArtisan.name);
        } else {
          setErrorMsg(
            result.feedback ||
              `This photo does not look like traditional ${category} works or storefronts. Please capture authentic craft elements!`,
          );
        }
      } catch (err) {
        setAnalyzing(false);
        const errorStr = err instanceof Error ? err.message : String(err);
        setErrorMsg("Failed to analyze artisan image: " + errorStr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlayAudio = (historyId: string) => {
    if (playingAudio === historyId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(historyId);
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("culture.tag")}
        </p>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {k("culture.title")}
        </h1>
      </header>

      <FahyGuide
        message="Welcome to your Artisan Passport! Visit master shops, scan their authentic signs to unlock Level I badges, and level up your profile to climb the tree to Grandmaster rank!"
        mood="proud"
      />

      {/* Cumulative Count Progress Bar */}
      <section className="px-5 mt-6">
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-forest/50">
                Passport Completion
              </p>
              <p className="font-display text-xl font-bold mt-0.5">
                {unlockedBadges.length} / 18 Badges Unlocked
              </p>
            </div>
            <Award className="w-8 h-8 text-fahy-yellow" />
          </div>
          <div className="w-full bg-forest/5 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedBadges.length / 18) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Interactive Badge Skill Tree Board */}
      <section className="px-5 mt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-display font-bold text-lg">Badge Skill Tree</h2>
            <p className="text-[10px] text-forest/50">
              Tap a badge ribbon to view requirements, claim, or equip.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-bold bg-forest/5 px-2.5 py-1 rounded-full text-forest">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fahy-yellow"></span>{" "}
              Active Path
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{" "}
              Locked
            </span>
          </div>
        </div>

        {/* Scrollable Map Container */}
        <div className="bg-forest/[0.02] border border-black/5 rounded-3xl overflow-x-auto relative pb-12 pt-8 pr-6 shadow-inner flex flex-col justify-center min-h-[480px]">
          <div className="flex gap-10 px-6 min-w-[950px] relative select-none">
            {/* Horizontal Pathway Connection Belts */}
            {/* Level I Belt */}
            <div className="absolute bottom-[36px] left-[150px] right-[80px] h-[3px] bg-forest/5 pointer-events-none z-0"></div>
            {/* Level II Belt */}
            <div className="absolute bottom-[164px] left-[150px] right-[80px] h-[3px] bg-forest/5 pointer-events-none z-0"></div>
            {/* Level III Belt */}
            <div className="absolute bottom-[292px] left-[150px] right-[80px] h-[3px] bg-forest/5 pointer-events-none z-0"></div>

            {/* Render Columns */}
            {BADGE_TRACKS.map((track) => {
              const isLevel1Unlocked = unlockedBadges.includes(
                track.badges[0].key,
              );
              const isLevel2Unlocked = unlockedBadges.includes(
                track.badges[1].key,
              );
              const isLevel3Unlocked = unlockedBadges.includes(
                track.badges[2].key,
              );

              return (
                <div
                  key={track.id}
                  className="flex flex-col items-center flex-shrink-0 w-36 relative z-10"
                >
                  {/* Column Label */}
                  <div className="text-center mb-6 h-10 flex flex-col justify-center">
                    <p
                      className={`text-[10px] font-bold font-display uppercase tracking-wider ${track.accentText}`}
                    >
                      {track.title}
                    </p>
                    <div className="w-8 h-[2px] bg-forest/10 mx-auto mt-1 rounded-full"></div>
                  </div>

                  <div className="flex flex-col items-center justify-between h-[340px]">
                    {/* Level III (Master) Node */}
                    <ScallopedBadge
                      emoji={track.badges[2].emoji}
                      color={track.color}
                      ribbonColor={track.ribbonColor}
                      unlocked={isLevel3Unlocked}
                      equipped={equippedBadge === track.badges[2].key}
                      level="III"
                      trackId={track.id}
                      onClick={() => {
                        setSelectedBadge(track.badges[2]);
                        setSelectedTrack(track);
                      }}
                    />

                    {/* Path Line III -> II */}
                    <div
                      className={`w-[3px] h-10 transition-all duration-300 ${
                        isLevel3Unlocked
                          ? "bg-fahy-yellow shadow-[0_0_8px_rgba(247,193,92,0.8)]"
                          : "bg-forest/10"
                      }`}
                    ></div>

                    {/* Level II (Journeyman) Node */}
                    <ScallopedBadge
                      emoji={track.badges[1].emoji}
                      color={track.color}
                      ribbonColor={track.ribbonColor}
                      unlocked={isLevel2Unlocked}
                      equipped={equippedBadge === track.badges[1].key}
                      level="II"
                      trackId={track.id}
                      onClick={() => {
                        setSelectedBadge(track.badges[1]);
                        setSelectedTrack(track);
                      }}
                    />

                    {/* Path Line II -> I */}
                    <div
                      className={`w-[3px] h-10 transition-all duration-300 ${
                        isLevel2Unlocked
                          ? "bg-fahy-yellow shadow-[0_0_8px_rgba(247,193,92,0.8)]"
                          : "bg-forest/10"
                      }`}
                    ></div>

                    {/* Level I (Apprentice) Node */}
                    <ScallopedBadge
                      emoji={track.badges[0].emoji}
                      color={track.color}
                      ribbonColor={track.ribbonColor}
                      unlocked={isLevel1Unlocked}
                      equipped={equippedBadge === track.badges[0].key}
                      level="I"
                      trackId={track.id}
                      onClick={() => {
                        setSelectedBadge(track.badges[0]);
                        setSelectedTrack(track);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vertical Level Labels on Left Margin */}
          <div className="absolute left-3 top-24 bottom-12 flex flex-col justify-between pointer-events-none text-[8px] font-bold uppercase tracking-widest text-forest/30">
            <div>Level III (Master)</div>
            <div className="mb-4">Level II (Adept)</div>
            <div className="mb-2">Level I (Novice)</div>
          </div>
        </div>
      </section>

      {/* Certification Centers (Scans) */}
      <section className="px-5 mt-10">
        <h2 className="font-display font-bold text-lg mb-4">
          {k("culture.centers")}
        </h2>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden"
        />

        <div className="space-y-3">
          {ARTISANS_DATA.map((artisan) => {
            const isUnlocked = unlockedBadges.includes(artisan.badgeKey);
            return (
              <div
                key={artisan.id}
                className="bg-white border border-black/5 rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:border-forest/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-peach/10 flex items-center justify-center text-peach">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold flex items-center gap-2 truncate">
                    {artisan.name}
                    {isUnlocked && (
                      <span className="text-[9px] bg-sage/20 text-sage-deep px-2 py-0.5 rounded-full font-bold">
                        Collected
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-forest/50">
                    {artisan.certName} · {artisan.distance} {k("culture.away")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveArtisan(artisan);
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="bg-forest text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <ScanLine className="w-3 h-3" /> {k("common.scan")}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Digital Oral Histories */}
      <section className="px-5 mt-10 mb-8">
        <h2 className="font-display font-bold text-lg mb-1">
          {k("culture.oral")}
        </h2>
        <p className="text-xs text-forest/50 mb-4">
          Unlock and play ambient oral history recordings by collecting shop
          badges.
        </p>

        <div className="space-y-3">
          {ARTISANS_DATA.map((artisan) => {
            const isUnlocked = unlockedBadges.includes(artisan.badgeKey);
            const isPlaying = playingAudio === artisan.id;

            return (
              <div
                key={artisan.id}
                className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                  isUnlocked
                    ? "bg-white border-black/5 shadow-xs"
                    : "bg-slate-50 border-black/5 opacity-70"
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Aspect Video Visual Card */}
                  <div
                    className={`w-20 h-14 rounded-2xl flex-shrink-0 bg-gradient-to-br ${isUnlocked ? artisan.gradient : "from-slate-200 to-slate-300"} flex items-center justify-center relative shadow-sm`}
                  >
                    {isUnlocked ? (
                      <button
                        onClick={() => handlePlayAudio(artisan.id)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-forest shadow-md transform hover:scale-110 active:scale-90 transition-all cursor-pointer"
                      >
                        {isPlaying ? (
                          <div className="flex gap-0.5 items-end justify-center w-3 h-3">
                            <span className="w-0.5 bg-forest h-2 animate-pulse"></span>
                            <span
                              className="w-0.5 bg-forest h-3 animate-pulse"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="w-0.5 bg-forest h-1 animate-pulse"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </div>
                        ) : (
                          <Play className="w-4 h-4 fill-forest stroke-forest translate-x-0.5" />
                        )}
                      </button>
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate">
                        {artisan.oralHistoryTitle}
                      </p>
                      <span className="text-[9px] bg-forest/5 text-forest/50 px-1.5 py-0.5 rounded-full font-bold">
                        {artisan.oralHistoryMeta}
                      </span>
                    </div>
                    <p className="text-[10px] text-forest/50 mt-1 line-clamp-2 leading-relaxed">
                      {isUnlocked
                        ? artisan.oralHistoryDesc
                        : "Unlock the Level I shop badge to hear this memory."}
                    </p>
                  </div>
                </div>

                {/* Simulated Audio Player Slider */}
                {isPlaying && (
                  <div className="px-4 pb-3 bg-forest/[0.02] border-t border-forest/5 pt-2 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-3.5 h-3.5 text-forest/50 animate-bounce" />
                      <div className="flex-1 h-1 bg-forest/10 rounded-full overflow-hidden relative">
                        <div className="bg-forest h-full w-[45%] rounded-full animate-[progress_15s_linear_infinite]"></div>
                      </div>
                      <span className="text-[9px] font-mono text-forest/50">
                        0:42 / {artisan.oralHistoryMeta}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Analyzing Loader Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-50 bg-forest/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <p className="text-fahy-yellow text-[10px] uppercase tracking-widest font-bold mb-2">
            Heritage AI Engine
          </p>
          <p className="text-white font-display text-lg mb-6">
            Analyzing storefront and handicraft...
          </p>
          <Loader2 className="w-12 h-12 text-fahy-yellow animate-spin" />
        </div>
      )}

      {/* Error Popup */}
      {errorMsg && (
        <div
          onClick={() => setErrorMsg("")}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in p-6"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm text-center border-2 border-peach">
            <div className="w-16 h-16 mx-auto mb-3 grid place-items-center bg-peach/20 rounded-full">
              <XCircle className="w-8 h-8 text-peach" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Requirement Failed
            </p>
            <p className="text-xs text-forest/80 mb-4">{errorMsg}</p>
            <button className="bg-peach text-white font-bold text-sm px-6 py-2.5 rounded-full w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {success && (
        <div
          onClick={() => setSuccess(false)}
          className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md grid place-items-center animate-fade-in p-6"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm text-center">
            <div className="w-12 h-12 bg-sage/30 text-sage-deep rounded-full grid place-items-center mx-auto mb-3">
              <Check className="w-6 h-6" strokeWidth={3} />
            </div>
            <p className="font-display font-bold text-lg leading-tight mb-2">
              Artisan Milestones Success!
            </p>
            <p className="text-xs text-forest/70 mb-4">{feedback}</p>
            <p className="text-xs font-bold text-peach mb-2">
              Rewards Saved & Added to Circular Wallet!
            </p>
            <button className="bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full w-full">
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Badge Details Dialog */}
      {selectedBadge && selectedTrack && (
        <div className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in p-6">
          <button
            onClick={() => {
              setSelectedBadge(null);
              setSelectedTrack(null);
            }}
            className="absolute top-6 right-6 w-10 h-10 grid place-items-center bg-white/10 rounded-full text-white cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>

          <div className="bg-white text-forest rounded-3xl p-8 max-w-xs text-center w-full border-4 border-fahy-yellow relative overflow-hidden shadow-2xl">
            {/* Top Badge Stamp */}
            <div className="mb-6 relative flex justify-center">
              <ScallopedBadge
                emoji={selectedBadge.emoji}
                color={selectedTrack.color}
                ribbonColor={selectedTrack.ribbonColor}
                unlocked={unlockedBadges.includes(selectedBadge.key)}
                level={selectedBadge.level}
                trackId={selectedTrack.id}
              />
            </div>

            <p className="font-display font-bold text-2xl mb-1">
              {selectedBadge.name}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mb-4">
              {selectedBadge.rarity} · Level {selectedBadge.level}
            </p>

            <div className="bg-forest/[0.03] border border-black/5 rounded-2xl p-4 mb-6 text-left">
              <p className="text-[10px] font-bold text-forest/50 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-xs font-medium leading-relaxed mb-3">
                {selectedBadge.description}
              </p>

              <p className="text-[10px] font-bold text-forest/50 uppercase tracking-wider mb-1">
                How to Unlock
              </p>
              <p className="text-xs font-semibold text-peach flex items-start gap-1.5">
                <Compass className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{selectedBadge.requirement}</span>
              </p>
            </div>

            {unlockedBadges.includes(selectedBadge.key) ? (
              <div className="space-y-2">
                {equippedBadge !== selectedBadge.key ? (
                  <button
                    onClick={async () => {
                      await handleEquip(selectedBadge.key);
                      setSelectedBadge(null);
                    }}
                    className="bg-forest text-white font-bold text-xs px-6 py-3 rounded-full w-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-sm"
                  >
                    <Award className="w-4 h-4" /> Equip Badge
                  </button>
                ) : (
                  <div className="bg-sage/10 text-sage-deep font-bold text-xs px-6 py-3 rounded-full w-full flex items-center justify-center gap-1.5 border border-sage/20">
                    <Check className="w-4 h-4 stroke-[3px]" /> Currently
                    Equipped
                  </div>
                )}

                <button
                  onClick={() => {
                    alert("Shared to Instagram/Facebook!");
                    setSelectedBadge(null);
                  }}
                  className="bg-forest/10 hover:bg-forest/15 text-forest font-bold text-xs px-6 py-3 rounded-full w-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share to Socials
                </button>
              </div>
            ) : (
              <div>
                {/* Check if user meets the unlock requirements to show an active "Claim" button */}
                {(!selectedBadge.levelRequired ||
                  level >= selectedBadge.levelRequired) &&
                (selectedBadge.level === "I" ||
                  (selectedBadge.level === "II" &&
                    unlockedBadges.includes(selectedTrack.badges[0].key)) ||
                  (selectedBadge.level === "III" &&
                    unlockedBadges.includes(selectedTrack.badges[1].key))) ? (
                  <button
                    onClick={() => handleClaimBadge(selectedBadge)}
                    className="bg-fahy-yellow text-forest font-bold text-xs px-6 py-3 rounded-full w-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-md"
                  >
                    <Crown className="w-4 h-4" /> Claim Badge & Rewards
                  </button>
                ) : (
                  <div className="bg-forest/5 text-forest/40 font-bold text-xs px-6 py-3 rounded-full w-full flex items-center justify-center gap-1.5 border border-forest/10">
                    <Lock className="w-3.5 h-3.5" /> Prerequisites Locked
                  </div>
                )}

                {selectedBadge.levelRequired &&
                  level < selectedBadge.levelRequired && (
                    <p className="text-[9px] font-bold text-peach mt-2">
                      Requires Profile Level {selectedBadge.levelRequired}{" "}
                      (Current: Level {level})
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
