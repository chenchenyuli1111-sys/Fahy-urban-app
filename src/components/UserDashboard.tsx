import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useAppState } from "@/lib/AppState";
import { useLang } from "@/lib/i18n";
import {
  subscribeToUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/lib/firestoreService";
import { PixelFahy, type FahyEvolution } from "./fahy/PixelFahy";
import { AchievementBadge } from "./fahy/AchievementBadge";
import { BADGES_REGISTRY } from "./fahy/AchievementBadge";
import {
  Award,
  Coins,
  Shield,
  Sparkles,
  MapPin,
  User as UserIcon,
  BookOpen,
  Edit2,
  Check,
  X,
  TrendingUp,
} from "lucide-react";

const stages: { level: number; id: FahyEvolution; name: string }[] = [
  { level: 1, id: "sprout", name: "The Sprout" },
  { level: 11, id: "potting_helper", name: "The Potting Helper" },
  { level: 21, id: "composter", name: "The Composter" },
  { level: 31, id: "community_gardener", name: "The Community Gardener" },
  { level: 41, id: "urban_gardener", name: "The Urban Gardener" },
  { level: 51, id: "soil_tester", name: "The Soil Tester" },
  { level: 61, id: "seed_librarian", name: "The Seed Librarian" },
  { level: 71, id: "pollinator_pal", name: "The Pollinator Pal" },
  { level: 81, id: "harvest_porter", name: "Harvest Porter" },
  { level: 91, id: "ecosystem_guardian", name: "Ecosystem Guardian" },
];

export function UserDashboard() {
  const { user } = useAuth();
  const { setEquippedBadge } = useAppState();
  const { formatCoins, k } = useLang();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserProfile(
        user.uid,
        (updatedProfile) => {
          setProfile(updatedProfile);
          setUsername(updatedProfile.username);
          setBio(updatedProfile.bio || "");
          setLocationPreference(updatedProfile.locationPreference || "");
          setPhotoURL(updatedProfile.photoURL || "");
          setLoading(false);
        },
        (err) => {
          console.error("Error subscribing to profile:", err);
          setError(
            "Could not sync your live profile data. Please check your connection.",
          );
          setLoading(false);
        },
      );

      return unsubscribe;
    } catch (err) {
      console.error("Profile initialization error:", err);
      setError("Failed to initialize profile connection.");
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center text-forest mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-forest">
          Access Denied
        </h3>
        <p className="text-sm text-forest/60 mt-1 max-w-xs">
          Please log in to view your personalized dashboard, stats, and badges.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-peach/10 border border-peach/30 rounded-3xl p-6 text-center max-w-md mx-auto my-8">
        <div className="w-12 h-12 bg-peach/20 text-peach rounded-full flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6" />
        </div>
        <h4 className="font-display font-bold text-base text-forest">
          Sync Connection Error
        </h4>
        <p className="text-xs text-forest/70 mt-1 mb-4 leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
          className="bg-forest text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-forest/90 active:scale-95 transition-transform inline-flex items-center gap-1.5"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="bg-forest/[0.03] border border-black/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 bg-forest/10 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-6 bg-forest/10 rounded-lg w-1/3" />
            <div className="h-4 bg-forest/10 rounded-lg w-1/4" />
            <div className="h-10 bg-forest/5 rounded-xl w-3/4 mt-2" />
          </div>
        </div>

        {/* Stats Bento Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 bg-forest/[0.03] border border-black/5 rounded-3xl p-4 flex flex-col justify-between min-h-[120px]">
            <div>
              <div className="h-3 bg-forest/10 rounded-md w-1/4 mb-2" />
              <div className="h-5 bg-forest/10 rounded-md w-1/2" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-2 bg-forest/10 rounded-full w-full" />
              <div className="h-3 bg-forest/5 rounded-md w-1/3 ml-auto" />
            </div>
          </div>
          <div className="bg-forest/[0.03] border border-black/5 rounded-3xl p-4 flex flex-col justify-between min-h-[120px]">
            <div className="h-3 bg-forest/10 rounded-md w-1/2" />
            <div className="h-8 bg-forest/10 rounded-md w-3/4" />
          </div>
          <div className="bg-forest/[0.03] border border-black/5 rounded-3xl p-4 flex flex-col justify-between min-h-[120px]">
            <div className="h-3 bg-forest/10 rounded-md w-1/2" />
            <div className="h-8 bg-forest/10 rounded-md w-3/4" />
          </div>
        </div>

        {/* Badges Box Skeleton */}
        <div className="bg-forest/[0.03] border border-black/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2 w-1/2">
              <div className="h-5 bg-forest/10 rounded-md w-1/2" />
              <div className="h-3 bg-forest/5 rounded-md w-3/4" />
            </div>
            <div className="h-7 bg-forest/10 rounded-full w-24" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="w-14 h-14 bg-forest/10 rounded-full" />
                <div className="h-3 bg-forest/10 rounded-md w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate current and next evolution stages
  const currentStage =
    stages
      .slice()
      .reverse()
      .find((s) => profile.level >= s.level) || stages[0];
  const nextStage = stages.find((s) => s.level > profile.level);
  const xpNeeded = nextStage ? nextStage.level * 100 : null;
  const progress = xpNeeded
    ? Math.min(100, (profile.xp / xpNeeded) * 100)
    : 100;

  // Split badges into earned and locked
  const earnedBadgeKeys = profile.badges || [];
  const allBadgeKeys = Object.keys(BADGES_REGISTRY);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(user.uid, {
        username: username.trim() || "Anonymous",
        bio: bio.trim(),
        locationPreference: locationPreference.trim(),
        photoURL: photoURL.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const toggleEquipBadge = async (badgeKey: string) => {
    if (profile.equippedBadge === badgeKey) {
      // Unequip
      await setEquippedBadge(null);
    } else {
      // Equip
      await setEquippedBadge(badgeKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner / User Profile Card */}
      <div className="bg-gradient-to-br from-peach/20 via-fahy-yellow/15 to-sage/10 rounded-3xl p-6 border border-black/5 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar Area with equipped badge ring and evolution */}
          <div className="relative flex-shrink-0 self-center">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-peach/40 shadow-sm flex items-center justify-center relative">
              {profile.equippedBadge && (
                <AchievementBadge
                  badgeKey={profile.equippedBadge}
                  size="sm"
                  showTooltip={true}
                  className="absolute -top-3 -left-3 z-20 drop-shadow-md"
                />
              )}
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.username}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <PixelFahy evolution={currentStage.id} size={80} />
              )}
              <div className="absolute -bottom-2 -right-2 bg-fahy-yellow text-forest text-[11px] px-2 py-0.5 rounded-full font-extrabold border-2 border-white shadow-xs">
                Lv. {profile.level}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-3 bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-xs">
                <div>
                  <label className="block text-[10px] font-bold text-forest/60 uppercase tracking-widest mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-forest font-semibold"
                    placeholder="E.g. EcoHero"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-forest/60 uppercase tracking-widest mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-forest"
                    placeholder="Tell us about yourself..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-forest/60 uppercase tracking-widest mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={locationPreference}
                      onChange={(e) => setLocationPreference(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-forest"
                      placeholder="E.g. Mong Kok"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-forest/60 uppercase tracking-widest mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-forest"
                      placeholder="https://images.unsplash.com..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-full border border-black/10 text-xs font-bold text-forest hover:bg-white/50 active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-1.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest/90 active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-bold text-2xl text-forest tracking-tight">
                    {profile.username}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-full hover:bg-forest/5 text-forest/60 hover:text-forest transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-forest/50 font-medium">
                  {profile.email}
                </p>
                {profile.bio && (
                  <p className="text-xs text-forest/70 mt-2 bg-white/40 border border-white/50 rounded-xl px-3 py-2 inline-block italic">
                    "{profile.bio}"
                  </p>
                )}
                {profile.locationPreference && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-forest/60 font-semibold">
                    <MapPin className="w-3 h-3 text-peach" />
                    <span>Based in {profile.locationPreference}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative ambient bubbles */}
        <div className="absolute right-[-40px] top-[-30px] w-40 h-40 bg-fahy-yellow/10 rounded-full blur-xl" />
        <div className="absolute left-[30%] bottom-[-50px] w-28 h-28 bg-peach/15 rounded-full blur-xl" />
      </div>

      {/* 2. Key Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Level & XP */}
        <div className="col-span-2 bg-white border border-black/5 rounded-3xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-forest/50 uppercase tracking-widest mb-0.5">
                Evolution Level
              </p>
              <h4 className="font-display font-bold text-lg text-forest leading-tight">
                {currentStage.name}
              </h4>
            </div>
            <div className="bg-fahy-yellow/20 text-forest p-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-fahy-yellow fill-fahy-yellow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold text-forest/60 mb-1.5">
              <span>{profile.xp} XP</span>
              <span>{xpNeeded ? `${xpNeeded} XP Needed` : "Max Stage"}</span>
            </div>
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-black/5 relative">
              <div
                className="h-full bg-gradient-to-r from-fahy-yellow to-sage-deep rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {nextStage && (
              <p className="text-[9px] text-forest/40 font-bold mt-1 text-right">
                Next evolution unlocks at level {nextStage.level}
              </p>
            )}
          </div>
        </div>

        {/* Peach Coins Balance */}
        <div className="bg-white border border-black/5 rounded-3xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-forest/50 uppercase tracking-widest">
              Peach Coins
            </span>
            <div className="bg-peach/20 text-peach p-1.5 rounded-xl">
              <Coins className="w-4 h-4 fill-peach" />
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-forest">
              {formatCoins(profile.coins)}
            </h3>
            <p className="text-[9px] font-bold text-forest/40 mt-1">
              Redeemable for eco-prizes
            </p>
          </div>
        </div>

        {/* Leaderboard Ranking Points */}
        <div className="bg-white border border-black/5 rounded-3xl p-4 shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-forest/50 uppercase tracking-widest">
              Total Points
            </span>
            <div className="bg-sage/20 text-sage-deep p-1.5 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-forest">
              {profile.points} pts
            </h3>
            <p className="text-[9px] font-bold text-forest/40 mt-1">
              Your neighborhood score
            </p>
          </div>
        </div>
      </div>

      {/* 3. Badge Collections (The Artisan Path) */}
      <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-2xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-forest leading-none">
              My Achievement Badges
            </h3>
            <p className="text-xs text-forest/50 mt-1">
              Unlocked: {earnedBadgeKeys.length} of {allBadgeKeys.length} · Tap
              an unlocked badge to equip/unequip as your avatar flair
            </p>
          </div>
          <div className="bg-forest/5 text-forest px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-fahy-yellow fill-fahy-yellow" />
            <span>
              {Math.round((earnedBadgeKeys.length / allBadgeKeys.length) * 100)}
              % Complete
            </span>
          </div>
        </div>

        {/* Dynamic Badge Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-items-center">
          {allBadgeKeys.map((badgeKey) => {
            const isEarned = earnedBadgeKeys.includes(badgeKey);
            const isEquipped = profile.equippedBadge === badgeKey;

            return (
              <div
                key={badgeKey}
                className="flex flex-col items-center text-center space-y-2 relative"
              >
                <AchievementBadge
                  badgeKey={badgeKey}
                  size="md"
                  unlocked={isEarned}
                  equipped={isEquipped}
                  showRibbons={isEarned}
                  onClick={
                    isEarned ? () => toggleEquipBadge(badgeKey) : undefined
                  }
                />
                <span className="text-[10px] font-bold text-forest/80 line-clamp-1 max-w-[80px]">
                  {BADGES_REGISTRY[badgeKey]?.name || "Badge"}
                </span>
                {isEquipped && (
                  <span className="absolute -bottom-2 text-[8px] font-extrabold text-fahy-yellow bg-forest px-1.5 py-0.5 rounded-full leading-none scale-90">
                    Equipped
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
