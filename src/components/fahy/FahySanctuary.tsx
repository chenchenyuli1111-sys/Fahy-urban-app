import { useState, useEffect, useRef } from "react";
import { useAppState } from "@/lib/AppState";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { PixelFahy } from "./PixelFahy";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { gameSounds } from "@/lib/sounds";
import {
  Sparkles,
  Heart,
  Droplet,
  Flame,
  ShoppingBag,
  Check,
  Utensils,
  Sun,
  Smile,
  Palette,
  Award,
  Music,
  Dices,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkle,
} from "lucide-react";

// Expanded Accessories Registry with 6 distinct slots!
export interface Accessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  desc: string;
  slot: "head" | "face" | "body" | "hand" | "companion" | "background";
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  stylePoints: number;
}

const ACC_REGISTRY: Record<string, Accessory> = {
  // Head Slot
  straw_hat: {
    id: "straw_hat",
    name: "Fisherman Straw Hat",
    emoji: "👒",
    cost: 50,
    desc: "A hand-woven straw hat from local Fa Hui elders.",
    slot: "head",
    rarity: "Common",
    stylePoints: 10,
  },
  crown: {
    id: "crown",
    name: "Emperor's Jade Crown",
    emoji: "👑",
    cost: 250,
    desc: "A legendary crown worn during grand temple festivals.",
    slot: "head",
    rarity: "Legendary",
    stylePoints: 80,
  },
  camellia_crown: {
    id: "camellia_crown",
    name: "Winter Camellia Crown",
    emoji: "🌸",
    cost: 90,
    desc: "Freshly-woven winter camellias and banyan leaves.",
    slot: "head",
    rarity: "Rare",
    stylePoints: 25,
  },
  lion_head: {
    id: "lion_head",
    name: "Lion Dance Helmet",
    emoji: "🦁",
    cost: 180,
    desc: "Traditional red and gold paper-mache lion head.",
    slot: "head",
    rarity: "Epic",
    stylePoints: 50,
  },
  dimsum_basket: {
    id: "dimsum_basket",
    name: "Steamer Basket Hat",
    emoji: "🥟",
    cost: 80,
    desc: "A cozy bamboo steamer basket that rests on Fahy's head.",
    slot: "head",
    rarity: "Rare",
    stylePoints: 20,
  },

  // Face Slot
  shades: {
    id: "shades",
    name: "Retro Nathan Sunglasses",
    emoji: "🕶️",
    cost: 60,
    desc: "Cool 1980s neon-district aviator shades.",
    slot: "face",
    rarity: "Rare",
    stylePoints: 15,
  },
  blush: {
    id: "blush",
    name: "Rosy Cheek Blush",
    emoji: "😊",
    cost: 30,
    desc: "Adds a warm, adorable rosy glow to Fahy's cheeks.",
    slot: "face",
    rarity: "Common",
    stylePoints: 5,
  },
  monocle: {
    id: "monocle",
    name: "Scholar's Monocle",
    emoji: "🧐",
    cost: 120,
    desc: "Worn by historical herbalists analyzing native flora.",
    slot: "face",
    rarity: "Epic",
    stylePoints: 35,
  },

  // Body Slot
  indigo_scarf: {
    id: "indigo_scarf",
    name: "Indigo Craft Scarf",
    emoji: "🧣",
    cost: 70,
    desc: "Midnight-blue natural indigo dyed scarf.",
    slot: "body",
    rarity: "Common",
    stylePoints: 12,
  },
  tang_suit: {
    id: "tang_suit",
    name: "Festive Tang Suit",
    emoji: "🥋",
    cost: 150,
    desc: "Festive silken red attire with fine gold threads.",
    slot: "body",
    rarity: "Epic",
    stylePoints: 45,
  },
  royal_cape: {
    id: "royal_cape",
    name: "Majestic Golden Cape",
    emoji: "🧥",
    cost: 220,
    desc: "Satin cape for the true guardian of the ecosystem.",
    slot: "body",
    rarity: "Legendary",
    stylePoints: 75,
  },

  // Hand Slot
  lantern: {
    id: "lantern",
    name: "Mid-Autumn Bamboo Lantern",
    emoji: "🏮",
    cost: 85,
    desc: "A sways-gently handmade bamboo paper lantern.",
    slot: "hand",
    rarity: "Rare",
    stylePoints: 20,
  },
  peach_blossom: {
    id: "peach_blossom",
    name: "Lucky Peach Blossom Sprig",
    emoji: "🎋",
    cost: 45,
    desc: "Brings infinite prosperity and happiness.",
    slot: "hand",
    rarity: "Common",
    stylePoints: 8,
  },
  tea_cup: {
    id: "tea_cup",
    name: "Celadon Oolong Cup",
    emoji: "🍵",
    cost: 65,
    desc: "Steaming hot oolong brewed to perfection.",
    slot: "hand",
    rarity: "Common",
    stylePoints: 12,
  },
  calligraphy_brush: {
    id: "calligraphy_brush",
    name: "Grandmaster's Ink Brush",
    emoji: "🖌️",
    cost: 130,
    desc: "Made from fine bamboo and banyan fibers.",
    slot: "hand",
    rarity: "Epic",
    stylePoints: 40,
  },

  // Companion Slot
  baby_sprout: {
    id: "baby_sprout",
    name: "Baby Sprout Spirit",
    emoji: "🌱",
    cost: 110,
    desc: "A cheerful little sprout spirit that hops alongside.",
    slot: "companion",
    rarity: "Rare",
    stylePoints: 30,
  },
  butterfly_pal: {
    id: "butterfly_pal",
    name: "Banyan Blue Butterfly",
    emoji: "🦋",
    cost: 140,
    desc: "A beautiful insect friend that hovers gently.",
    slot: "companion",
    rarity: "Epic",
    stylePoints: 40,
  },
  goldfish_pal: {
    id: "goldfish_pal",
    name: "Celestial Goldfish",
    emoji: "🐟",
    cost: 260,
    desc: "A legendary floating goldfish bringing good karma.",
    slot: "companion",
    rarity: "Legendary",
    stylePoints: 85,
  },

  // Background/Aura Slot
  celestial_aura: {
    id: "celestial_aura",
    name: "Celestial Gold Sparkles",
    emoji: "✨",
    cost: 125,
    desc: "Ethereal golden particles swirl around Fahy.",
    slot: "background",
    rarity: "Epic",
    stylePoints: 35,
  },
  wind_aura: {
    id: "wind_aura",
    name: "Fa Hui Autumn Swirls",
    emoji: "🍃",
    cost: 95,
    desc: "Refreshing sage-green autumn leaves blowing.",
    slot: "background",
    rarity: "Rare",
    stylePoints: 22,
  },
  neon_sky: {
    id: "neon_sky",
    name: "Temple Neon Glow",
    emoji: "🌆",
    cost: 210,
    desc: "Surrounds Fahy with cyber-neon light rays.",
    slot: "background",
    rarity: "Legendary",
    stylePoints: 70,
  },
  lunar_aura: {
    id: "lunar_aura",
    name: "Mid-Autumn Moonbeam",
    emoji: "🌕",
    cost: 160,
    desc: "Baths Fahy in a calm, mystical silvery lunar light.",
    slot: "background",
    rarity: "Epic",
    stylePoints: 50,
  },
};

const FOODS = [
  {
    id: "egg_tart",
    name: "Egg Tart (蛋撻)",
    cost: 8,
    hunger: 15,
    joy: 20,
    emoji: "🥧",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: "herbal_tea",
    name: "Herbal Tea (涼茶)",
    cost: 10,
    hunger: 10,
    joy: 10,
    emoji: "🍵",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    id: "claypot_rice",
    name: "Claypot Rice (煲仔飯)",
    cost: 15,
    hunger: 30,
    joy: 15,
    emoji: "🍲",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
];

interface PetState {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  activeHat: string | null; // Keep for backwards compatibility
  itemsOwned: string[];
  equipped: {
    head?: string | null;
    face?: string | null;
    body?: string | null;
    hand?: string | null;
    companion?: string | null;
    background?: string | null;
  };
  gardenPlot?: {
    type: "banyan" | "peach" | null;
    wateredCount: number;
    growth: number; // 0 to 100
    plantedAt: number | null;
  };
  dailyArcadeCoins?: number;
  lastArcadeDate?: string;
}

interface CatchItem {
  id: string;
  x: number;
  y: number;
  type: "coin" | "bloom" | "trash";
  speed: number;
  emoji: string;
}

export function FahySanctuary() {
  const { user } = useAuth();
  const { coins, addCoins, deductCoins, addXp, addPoints, level } =
    useAppState();
  const { formatCoins } = useLang();

  // Pet Stats
  const [pet, setPet] = useState<PetState>({
    hunger: 75,
    happiness: 70,
    cleanliness: 80,
    energy: 70,
    activeHat: null,
    itemsOwned: [],
    equipped: {},
    gardenPlot: { type: null, wateredCount: 0, growth: 0, plantedAt: null },
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "care" | "shop" | "wardrobe" | "garden" | "arcade" | "oracle"
  >("care");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSaving, setShowSaving] = useState(false);

  // Shop Category Filter
  const [shopCategory, setShopCategory] = useState<
    "all" | "head" | "face" | "body" | "hand" | "companion" | "background"
  >("all");

  // Interaction State Animations
  const [isTickling, setIsTickling] = useState(false);
  const [isFeeding, setIsFeeding] = useState<string | null>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [tickleCooldown, setTickleCooldown] = useState(false);

  // Music Sways
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Oracle Daily Game State
  const [oracleState, setOracleState] = useState<
    "idle" | "shaking" | "revealed"
  >("idle");
  const [fortuneText, setFortuneText] = useState("");
  const [luckLevel, setLuckLevel] = useState("");
  const [hasShakenToday, setHasShakenToday] = useState(false);

  // Arcade Catcher Game State
  const [arcadeState, setArcadeState] = useState<
    "idle" | "playing" | "game_over"
  >("idle");
  const [catcherX, setCatcherX] = useState(50); // percentage 0 - 100
  const [arcadeScore, setArcadeScore] = useState(0);
  const [arcadeCoinsEarned, setArcadeCoinsEarned] = useState(0);
  const [arcadeTimer, setArcadeTimer] = useState(25);
  const [droppingItems, setDroppingItems] = useState<CatchItem[]>([]);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from Firestore (or LocalStorage fallback)
  useEffect(() => {
    async function loadPetData() {
      if (!user) {
        // Load Guest pet data
        const local = localStorage.getItem("fahy_pet_state");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            // Ensure schema safety
            if (!parsed.equipped) parsed.equipped = {};
            if (!parsed.gardenPlot)
              parsed.gardenPlot = {
                type: null,
                wateredCount: 0,
                growth: 0,
                plantedAt: null,
              };
            setPet(parsed);
          } catch (e) {
            console.error("Failed to parse local pet state:", e);
          }
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) {
          const data = uSnap.data();
          if (data.fahyPet) {
            const dbPet = data.fahyPet as PetState;
            // Migrations & default layers
            if (!dbPet.equipped) {
              dbPet.equipped = { head: dbPet.activeHat || null };
            }
            if (!dbPet.gardenPlot) {
              dbPet.gardenPlot = {
                type: null,
                wateredCount: 0,
                growth: 0,
                plantedAt: null,
              };
            }
            setPet(dbPet);
          } else {
            // Default initial pet stats
            const defaultPet: PetState = {
              hunger: 75,
              happiness: 70,
              cleanliness: 80,
              energy: 70,
              activeHat: null,
              itemsOwned: [],
              equipped: {},
              gardenPlot: {
                type: null,
                wateredCount: 0,
                growth: 0,
                plantedAt: null,
              },
            };
            setPet(defaultPet);
            await updateDoc(doc(db, "users", user.uid), {
              fahyPet: defaultPet,
            });
          }
        }
      } catch (err) {
        console.error("Error loading pet state:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPetData();
  }, [user]);

  // Handle auto pet decay over time (simulation feel!)
  useEffect(() => {
    const timer = setInterval(() => {
      setPet((prev) => {
        const next = {
          ...prev,
          hunger: Math.max(0, prev.hunger - 1),
          happiness: Math.max(0, prev.happiness - 1.2),
          cleanliness: Math.max(0, prev.cleanliness - 0.7),
          energy: Math.max(0, prev.energy - 0.4),
        };
        savePetState(next);
        return next;
      });
    }, 45000); // decay slightly every 45s

    return () => clearInterval(timer);
  }, [user]);

  const savePetState = async (updatedPet: PetState) => {
    if (!user) {
      localStorage.setItem("fahy_pet_state", JSON.stringify(updatedPet));
      return;
    }
    try {
      setShowSaving(true);
      await updateDoc(doc(db, "users", user.uid), { fahyPet: updatedPet });
      setTimeout(() => setShowSaving(false), 800);
    } catch (e) {
      console.error("Failed to save pet state to Firestore:", e);
    }
  };

  const handleTickle = () => {
    if (tickleCooldown) return;
    setIsTickling(true);
    setTickleCooldown(true);
    gameSounds.play("success");

    const nextPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 15),
      energy: Math.min(100, pet.energy + 5),
    };
    setPet(nextPet);
    savePetState(nextPet);

    addXp(5);
    addPoints(20);

    setTimeout(() => setIsTickling(false), 1200);
    setTimeout(() => setTickleCooldown(false), 8000); // 8s tickle cooldown
  };

  const handleFeed = async (
    foodId: string,
    cost: number,
    hungerBoost: number,
    joyBoost: number,
  ) => {
    if (coins < cost) {
      setErrorMsg("Not enough Peach Coins!");
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setIsFeeding(foodId);
    const success = await deductCoins(cost, `Fed Fahy: ${foodId}`);
    if (success) {
      gameSounds.play("eat");
      const nextPet = {
        ...pet,
        hunger: Math.min(100, pet.hunger + hungerBoost),
        happiness: Math.min(100, pet.happiness + joyBoost),
        energy: Math.min(100, pet.energy + 8),
      };
      setPet(nextPet);
      savePetState(nextPet);

      addXp(8);
      addPoints(30);
    }

    setTimeout(() => setIsFeeding(null), 2000);
  };

  const handleWaterGarden = async () => {
    const cost = 5;
    if (coins < cost) {
      setErrorMsg("Not enough Peach Coins!");
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setIsWatering(true);
    const success = await deductCoins(cost, "Watered Fahy's Garden");
    if (success) {
      gameSounds.play("water");
      const nextPet = {
        ...pet,
        cleanliness: Math.min(100, pet.cleanliness + 25),
        happiness: Math.min(100, pet.happiness + 5),
        energy: Math.min(100, pet.energy + 10),
      };
      setPet(nextPet);
      savePetState(nextPet);

      addXp(6);
      addPoints(25);
    }

    setTimeout(() => setIsWatering(false), 2000);
  };

  // -------------------------
  // BOUTIQUE RETAIL
  // -------------------------
  const handleBuyAccessory = async (accId: string, cost: number) => {
    if (coins < cost) {
      setErrorMsg("Not enough Peach Coins!");
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (pet.itemsOwned.includes(accId)) return;

    const accessory = ACC_REGISTRY[accId];
    if (!accessory) return;

    const success = await deductCoins(
      cost,
      `Bought Fahy Accessory: ${accessory.name}`,
    );
    if (success) {
      gameSounds.play("coin");
      // Auto-equip into correct slot
      const nextEquipped = { ...(pet.equipped || {}) };
      nextEquipped[accessory.slot] = accId;

      const nextPet = {
        ...pet,
        itemsOwned: [...pet.itemsOwned, accId],
        equipped: nextEquipped,
        activeHat: accessory.slot === "head" ? accId : pet.activeHat, // legacy backup
      };
      setPet(nextPet);
      savePetState(nextPet);
      addXp(15);
      addPoints(100);

      setSuccessMsg(`Purchased & equipped ${accessory.name}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleShareCollectionItem = (itemId: string) => {
    const item = ACC_REGISTRY[itemId];
    if (!item) return;

    gameSounds.play("success");
    setSuccessMsg(`Shared ${item.name} with Fahy! Fahy loves your style! 💖`);
    setTimeout(() => setSuccessMsg(""), 4000);

    const nextPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 20),
    };
    setPet(nextPet);
    savePetState(nextPet);

    addXp(10);
    addPoints(40);
  };

  // -------------------------
  // WARDROBE MULTI-SLOT EQUIP
  // -------------------------
  const handleEquipAccessory = (
    slot: keyof PetState["equipped"],
    accId: string | null,
  ) => {
    gameSounds.play("click");
    const nextEquipped = { ...(pet.equipped || {}) };
    nextEquipped[slot] = accId;

    const nextPet = {
      ...pet,
      equipped: nextEquipped,
      activeHat: slot === "head" ? accId : pet.activeHat, // legacy backup
    };
    setPet(nextPet);
    savePetState(nextPet);
  };

  const getStyleScore = () => {
    let score = 0;
    const equipped = pet.equipped || {};
    Object.values(equipped).forEach((id) => {
      if (id && ACC_REGISTRY[id]) {
        score += ACC_REGISTRY[id].stylePoints;
      }
    });
    return score;
  };

  const getStyleRanking = () => {
    const score = getStyleScore();
    if (score >= 200)
      return {
        title: "Legendary Stylist 👑",
        color: "text-amber-500",
        desc: "Fa Hui's grand imperial trendsetter!",
      };
    if (score >= 120)
      return {
        title: "Artisanal Trendsetter ✨",
        color: "text-purple-500",
        desc: "A gorgeous display of local textures.",
      };
    if (score >= 50)
      return {
        title: "Chic Pathfinder 🌿",
        color: "text-forest",
        desc: "Natural harmony with city style.",
      };
    return {
      title: "Humble Wanderer 🚶",
      color: "text-forest/60",
      desc: "Basic park-safe traveler outfit.",
    };
  };

  // -------------------------
  // ECO-GARDEN IDLE FARMING
  // -------------------------
  const handlePlantSeed = async (type: "banyan" | "peach") => {
    const cost = type === "banyan" ? 15 : 30;
    if (coins < cost) {
      setErrorMsg("Not enough Peach Coins to buy seeds!");
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    const success = await deductCoins(cost, `Planted ${type} Seed`);
    if (success) {
      gameSounds.play("success");
      const nextPet = {
        ...pet,
        gardenPlot: {
          type,
          wateredCount: 0,
          growth: 10,
          plantedAt: Date.now(),
        },
      };
      setPet(nextPet);
      savePetState(nextPet);
      setSuccessMsg(
        `Planted ${type === "banyan" ? "Banyan Seed" : "Peach Pit"}!`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleWaterCrop = () => {
    const cost = 4;
    if (coins < cost) {
      setErrorMsg("Not enough coins to water crop!");
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (!pet.gardenPlot || !pet.gardenPlot.type) return;

    deductCoins(cost, "Watered Eco-Garden Seed");
    gameSounds.play("water");
    const nextPlot = { ...pet.gardenPlot };
    nextPlot.wateredCount += 1;
    // Boost growth significantly on watering click!
    nextPlot.growth = Math.min(100, nextPlot.growth + 20);

    const nextPet = {
      ...pet,
      gardenPlot: nextPlot,
    };
    setPet(nextPet);
    savePetState(nextPet);

    addXp(3);
    addPoints(10);
  };

  const handleHarvestCrop = () => {
    if (!pet.gardenPlot || pet.gardenPlot.growth < 100) return;

    gameSounds.play("levelUp");
    const type = pet.gardenPlot.type;
    const reward = type === "banyan" ? 40 : 75;
    const bonusXp = type === "banyan" ? 15 : 30;
    const bonusPoints = type === "banyan" ? 50 : 120;

    addCoins(reward, `Harvested ${type} Garden Yield`);
    addXp(bonusXp);
    addPoints(bonusPoints);

    const nextPet = {
      ...pet,
      gardenPlot: {
        type: null,
        wateredCount: 0,
        growth: 0,
        plantedAt: null,
      },
    };
    setPet(nextPet);
    savePetState(nextPet);

    setSuccessMsg(
      `Harvested! Earned +${formatCoins(reward)} & +${bonusPoints} PTS!`,
    );
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // -------------------------
  // DAILY BAMBOO ORACLE GAME
  // -------------------------
  const handleShakeOracle = () => {
    if (hasShakenToday) {
      setErrorMsg(
        "You have already received your daily fortune! Come back soon.",
      );
      gameSounds.play("fail");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setOracleState("shaking");
    setFortuneText("");
    gameSounds.play("shake");

    // Repeat shake audio chime
    const shakeInterval = setInterval(() => {
      gameSounds.play("shake");
    }, 450);

    setTimeout(() => {
      clearInterval(shakeInterval);
      gameSounds.play("success");
      const fortunes = [
        {
          luck: "Grand Auspicious (大吉) 🔴",
          reward: 60,
          text: "The giant Banyan roots run extremely deep; your foundation is completely secure. Expect immense prosperity in your local tasks!",
        },
        {
          luck: "Middle Auspicious (中吉) 🟡",
          reward: 40,
          text: "Peach blossoms align under the autumn moon. A fruitful partnership or financial breeze is coming your way very soon.",
        },
        {
          luck: "Small Auspicious (小吉) 🟢",
          reward: 30,
          text: "Herbal tea tastes bitter, but the wild leaves settle cleanly. Patience pays off. Your next scan will be successful.",
        },
        {
          luck: "Prosperous Fortune (吉) 🔵",
          reward: 25,
          text: "Traditional lantern light directs your steps through Nathan Road safely. Walk ahead boldly, neighbor!",
        },
      ];

      const picked = fortunes[Math.floor(Math.random() * fortunes.length)];
      setLuckLevel(picked.luck);
      setFortuneText(picked.text);
      setOracleState("revealed");
      setHasShakenToday(true);

      addCoins(picked.reward, `Daily Oracle Luck Reward: ${picked.luck}`);
      addXp(10);
      addPoints(30);
    }, 2200);
  };

  // -------------------------
  // COIN CATCHER ARCADE GAME
  // -------------------------
  const startArcadeGame = () => {
    setArcadeState("playing");
    setArcadeScore(0);
    setArcadeCoinsEarned(0);
    setArcadeTimer(45); // Extended time as requested (45s instead of 25s)
    setDroppingItems([]);

    // Spawn falling elements loop
    spawnIntervalRef.current = setInterval(() => {
      const types: ("coin" | "bloom" | "trash")[] = [
        "coin",
        "coin",
        "bloom",
        "trash",
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const emojis = { coin: "🪙", bloom: "🌸", trash: "🪰" };
      const speed = type === "trash" ? 4.5 : type === "bloom" ? 3.8 : 3.0;

      const newItem: CatchItem = {
        id: Math.random().toString(),
        x: 5 + Math.random() * 90,
        y: 0,
        type,
        speed,
        emoji: emojis[type],
      };
      setDroppingItems((prev) => [...prev, newItem]);
    }, 1200);

    // Frame/Ticks game update loop
    gameIntervalRef.current = setInterval(() => {
      // 1. Countdown timer
      setArcadeTimer((prev) => {
        if (prev <= 1) {
          endArcadeGame();
          return 0;
        }
        return prev - 1;
      });

      // 2. Update Y drops and check collisions
      setDroppingItems((prevItems) => {
        const nextItems: CatchItem[] = [];

        prevItems.forEach((item) => {
          const nextY = item.y + item.speed;

          // Check if item reached catcher height (80% - 90%)
          if (nextY >= 80 && nextY <= 90) {
            const distance = Math.abs(item.x - catcherX);
            if (distance <= 12) {
              // Collided / Caught!
              if (item.type === "coin") {
                setArcadeScore((s) => s + 10);
                setArcadeCoinsEarned((c) => c + 3);
                gameSounds.play("coin");
              } else if (item.type === "bloom") {
                setArcadeScore((s) => s + 15);
                setArcadeCoinsEarned((c) => c + 5);
                gameSounds.play("success");
              } else {
                setArcadeScore((s) => Math.max(0, s - 8)); // penalty
                gameSounds.play("fail");
              }
              // Item caught, don't push to next list
              return;
            }
          }

          // If item is still inside bounds, keep it
          if (nextY < 100) {
            nextItems.push({ ...item, y: nextY });
          }
        });

        return nextItems;
      });
    }, 100);
  };

  const endArcadeGame = () => {
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    setArcadeState("game_over");
    setDroppingItems([]);
    gameSounds.play("success");

    // Enforce 10 daily max Peach Coins limit
    const todayStr = new Date().toISOString().split("T")[0];
    const isNewDay = pet.lastArcadeDate !== todayStr;
    const currentEarnedToday = isNewDay ? 0 : pet.dailyArcadeCoins || 0;
    const maxAllowedToEarn = Math.max(0, 10 - currentEarnedToday);
    const actualCoinsToEarn = Math.min(arcadeCoinsEarned, maxAllowedToEarn);

    if (actualCoinsToEarn > 0) {
      addCoins(actualCoinsToEarn, "Arcade Bloom-Catching Run");
      addPoints(arcadeScore * 3);
      addXp(Math.round(arcadeScore / 2));

      const nextPet = {
        ...pet,
        dailyArcadeCoins: currentEarnedToday + actualCoinsToEarn,
        lastArcadeDate: todayStr,
      };
      setPet(nextPet);
      savePetState(nextPet);

      setSuccessMsg(
        `Victory! Earned +${formatCoins(actualCoinsToEarn)} Peach Coins (Daily Collected: ${currentEarnedToday + actualCoinsToEarn}/10).`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      addPoints(arcadeScore * 3);
      addXp(Math.round(arcadeScore / 2));

      const nextPet = {
        ...pet,
        lastArcadeDate: todayStr,
        dailyArcadeCoins: isNewDay ? 0 : pet.dailyArcadeCoins || 0,
      };
      setPet(nextPet);
      savePetState(nextPet);

      setSuccessMsg(
        `Run complete! You gained +${arcadeScore * 3} PTS but earned 0 Peach Coins since you already hit today's daily 10-coin limit!`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, []);

  const getFahyExpression = () => {
    if (pet.hunger < 25) return "😫 Hunger";
    if (pet.happiness < 25) return "😢 Lonely";
    if (pet.cleanliness < 25) return "🍂 Messy";
    if (isTickling) return "😍 Joyful!";
    if (isFeeding) return "😋 Nomnom!";
    if (isWatering) return "🍃 Fresh!";
    if (musicPlaying) return "🎵 Dancing!";
    return "😊 Peaceful";
  };

  // Filter Shop items based on Category
  const filteredShopItems = Object.entries(ACC_REGISTRY).filter(([_, item]) => {
    if (shopCategory === "all") return true;
    return item.slot === shopCategory;
  });

  if (loading) {
    return (
      <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-5 bg-forest/10 rounded-md w-1/3" />
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-forest/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-forest/10 rounded-md w-3/4" />
            <div className="h-3 bg-forest/5 rounded-md w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Active Equipped items
  const equipped = pet.equipped || {};

  return (
    <div className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 border-4 border-emerald-800 rounded-[36px] p-4 md:p-5 shadow-2xl relative overflow-hidden font-sans text-emerald-50 select-none">
      {/* Handheld controller D-Pad decorative graphics */}
      <div className="absolute left-4 bottom-5 w-12 h-12 opacity-10 pointer-events-none hidden sm:block">
        <div className="absolute top-4 left-0 w-12 h-4 bg-emerald-100 rounded-sm" />
        <div className="absolute top-0 left-4 w-4 h-12 bg-emerald-100 rounded-sm" />
      </div>
      {/* Handheld mock speaker grills */}
      <div className="absolute right-6 bottom-5 flex gap-1 rotate-12 opacity-10 pointer-events-none">
        <div className="w-1.5 h-6 bg-emerald-100 rounded-full" />
        <div className="w-1.5 h-6 bg-emerald-100 rounded-full" />
        <div className="w-1.5 h-6 bg-emerald-100 rounded-full" />
      </div>

      {/* Save indicator */}
      {showSaving && (
        <span className="absolute top-4 right-4 text-[9px] font-extrabold text-fahy-yellow bg-black/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 z-50">
          <span className="w-1.5 h-1.5 rounded-full bg-fahy-yellow animate-ping" />
          Syncing...
        </span>
      )}

      {/* Title */}
      <div className="flex items-center gap-2 mb-3 px-1 text-white">
        <Heart className="w-4 h-4 text-peach fill-peach animate-pulse" />
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-fahy-yellow">
          FAHY DECK v2.0
        </h3>
        <span className="text-[9px] bg-black/40 border border-emerald-750 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full ml-auto uppercase tracking-wide">
          {getFahyExpression()}
        </span>
      </div>

      {/* Virtual Screen Glass Bezel Screen wrapper */}
      <div className="bg-white border-4 border-emerald-950 rounded-2xl p-4 shadow-inner text-forest">
        {/* Main Sandbox Interactive Stage */}
        <div className="bg-gradient-to-b from-sage/10 to-transparent rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[190px] border border-black/[0.02] overflow-hidden">
          {/* BACKGROUND AURA SLOT LAYER */}
          {equipped.background === "celestial_aura" && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -40, 0],
                    x: [0, i % 2 === 0 ? 30 : -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="absolute text-yellow-400 text-xs"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </div>
          )}

          {equipped.background === "wind_aura" && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{
                    x: [-50, 200],
                    y: [20, -20],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "linear",
                  }}
                  className="absolute text-emerald-600/30 text-sm"
                  style={{
                    top: `${10 + Math.random() * 70}%`,
                    left: "-50px",
                  }}
                >
                  🍃
                </motion.span>
              ))}
            </div>
          )}

          {equipped.background === "neon_sky" && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden bg-gradient-to-tr from-fuchsia-950/10 via-slate-950/5 to-indigo-950/10">
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-fuchsia-500/10 to-transparent animate-pulse" />
              <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-cyan-400/10 blur-xl animate-pulse" />
              <div
                className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-fuchsia-400/10 blur-xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
          )}

          {equipped.background === "lunar_aura" && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden bg-indigo-950/5">
              {/* Beautiful big crescent moon */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-4 left-6 text-2xl filter drop-shadow-md opacity-90"
              >
                🌕
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-300/5 to-transparent" />
            </div>
          )}

          {/* Animated Background Flora (Default fallback) */}
          {!equipped.background && (
            <div className="absolute inset-0 flex justify-between items-end px-6 pointer-events-none opacity-40 select-none z-0">
              <span
                className="text-xl animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                🌱
              </span>
              <span
                className="text-2xl animate-bounce"
                style={{ animationDelay: "0.8s" }}
              >
                🌸
              </span>
              <span
                className="text-xl animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                🌿
              </span>
            </div>
          )}

          {/* Rain particles during watering */}
          <AnimatePresence>
            {isWatering && (
              <div className="absolute inset-x-0 top-0 h-32 overflow-hidden pointer-events-none flex justify-around z-20">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 150, opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: Math.random() * 0.5,
                    }}
                    className="w-0.5 h-3 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Crumbs during feeding */}
          <AnimatePresence>
            {isFeeding && (
              <div className="absolute inset-x-0 top-12 flex justify-center pointer-events-none z-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: (Math.random() - 0.5) * 60,
                      y: 60 + Math.random() * 30,
                      opacity: 0,
                      scale: 0.5,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                    style={{ marginLeft: i * 2 }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Fahy Avatar container with overlays */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Fahy Bubble Pod - Solid white circular background to eliminate JPG square bounding box */}
            <div className="bg-white/95 rounded-full w-36 h-36 flex items-center justify-center shadow-lg border-4 border-emerald-500/20 relative overflow-visible">
              {/* Accessory Overlays container that animates everything together in perfect sync */}
              <div
                className={`relative w-28 h-28 flex items-center justify-center transition-all duration-300 ${
                  isTickling
                    ? "animate-wiggle scale-110"
                    : musicPlaying
                      ? "animate-bounce scale-105"
                      : "animate-float"
                }`}
              >
                {/* COMPANION SLOT */}
                {equipped.companion && (
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 4, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl select-none z-25 pointer-events-none filter drop-shadow-sm"
                  >
                    {equipped.companion === "baby_sprout" && "🌱"}
                    {equipped.companion === "butterfly_pal" && "🦋"}
                    {equipped.companion === "goldfish_pal" && "🐟"}
                  </motion.div>
                )}

                <PixelFahy
                  level={level}
                  size={110}
                  interactive={false}
                  className="w-full h-full animate-none"
                />

                {/* HEAD OVERLAYS */}
                {equipped.head === "straw_hat" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none w-16 h-7 drop-shadow-md z-30"
                  >
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path d="M10 25 C10 10, 90 10, 90 25 Z" fill="#E6C280" />
                      <rect
                        x="30"
                        y="22"
                        width="40"
                        height="4"
                        fill="#D4AF37"
                      />
                      <path
                        d="M5 25 Q50 30, 95 25 Q50 35, 5 25"
                        fill="#C5A059"
                      />
                    </svg>
                  </motion.div>
                )}

                {equipped.head === "crown" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none w-10 h-8 drop-shadow-md z-30"
                  >
                    {/* Royal golden-jade crown SVG */}
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <path
                        d="M5 35 L5 15 L12 23 L20 10 L28 23 L35 15 L35 35 Z"
                        fill="#FBBC05"
                      />
                      <rect x="5" y="32" width="30" height="4" fill="#10B981" />
                      <circle cx="20" cy="10" r="2" fill="#EA4335" />
                      <circle cx="5" cy="15" r="2" fill="#10B981" />
                      <circle cx="35" cy="15" r="2" fill="#10B981" />
                    </svg>
                  </motion.div>
                )}

                {equipped.head === "camellia_crown" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none w-16 h-5 drop-shadow-sm z-30 flex gap-0.5 justify-center items-center"
                  >
                    <span className="text-xs animate-pulse">🌸</span>
                    <span className="text-[10px]">🍃</span>
                    <span
                      className="text-xs animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    >
                      🌸
                    </span>
                  </motion.div>
                )}

                {equipped.head === "lion_head" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none w-16 h-10 drop-shadow-lg z-30"
                  >
                    <span className="text-3xl">🦁</span>
                  </motion.div>
                )}

                {equipped.head === "dimsum_basket" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none w-12 h-6 drop-shadow-sm z-30"
                  >
                    {/* Steam basket hat */}
                    <svg viewBox="0 0 50 30" className="w-full h-full">
                      <ellipse cx="25" cy="18" rx="20" ry="8" fill="#D4B483" />
                      <rect x="5" y="10" width="40" height="8" fill="#C2A173" />
                      <ellipse cx="25" cy="10" rx="20" ry="6" fill="#D4B483" />
                      <line
                        x1="25"
                        y1="4"
                        x2="25"
                        y2="8"
                        stroke="#8E704C"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* FACE OVERLAYS */}
                {equipped.face === "shades" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none w-12 h-4 z-30"
                  >
                    <div className="flex gap-1 justify-center">
                      <div className="w-5 h-4 bg-slate-950 rounded-b-md border border-cyan-400" />
                      <div className="w-1.5 h-0.5 bg-slate-900 mt-1.5" />
                      <div className="w-5 h-4 bg-slate-950 rounded-b-md border border-cyan-400" />
                    </div>
                  </motion.div>
                )}

                {equipped.face === "blush" && (
                  <div className="absolute top-[52px] inset-x-0 pointer-events-none z-28 flex justify-between px-6">
                    <div className="w-3.5 h-1.5 bg-rose-400/50 rounded-full blur-xs" />
                    <div className="w-3.5 h-1.5 bg-rose-400/50 rounded-full blur-xs" />
                  </div>
                )}

                {equipped.face === "monocle" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-10 left-[55%] pointer-events-none w-5 h-5 z-30"
                  >
                    <div className="w-4 h-4 border-2 border-amber-400 rounded-full bg-yellow-100/10" />
                    <div className="w-0.5 h-4 bg-amber-400 rotate-12 ml-2 mt-0.5" />
                  </motion.div>
                )}

                {/* BODY OVERLAYS */}
                {equipped.body === "indigo_scarf" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none w-14 h-5 drop-shadow-sm z-25"
                  >
                    <svg viewBox="0 0 80 30" className="w-full h-full">
                      <path
                        d="M15 10 Q40 20, 65 10 Q40 5, 15 10"
                        fill="#2E4A80"
                        stroke="#1D2E54"
                        strokeWidth="1"
                      />
                      <path d="M50 12 L55 25 L65 24 L58 10 Z" fill="#243C6B" />
                      <path d="M25 12 L20 28 L12 26 L18 10 Z" fill="#243C6B" />
                    </svg>
                  </motion.div>
                )}

                {equipped.body === "tang_suit" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none w-12 h-6 z-25"
                  >
                    {/* Traditional Red Tang Suit SVG */}
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                      <path d="M5 5 L55 5 L50 30 L10 30 Z" fill="#EA4335" />
                      <line
                        x1="30"
                        y1="5"
                        x2="30"
                        y2="30"
                        stroke="#FBBC05"
                        strokeWidth="2"
                      />
                      {/* Frogs/Buttons */}
                      <line
                        x1="24"
                        y1="12"
                        x2="36"
                        y2="12"
                        stroke="#FBBC05"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="24"
                        y1="20"
                        x2="36"
                        y2="20"
                        stroke="#FBBC05"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </motion.div>
                )}

                {equipped.body === "royal_cape" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none w-16 h-8 z-24"
                  >
                    <svg viewBox="0 0 80 40" className="w-full h-full">
                      <path
                        d="M10 5 Q40 0, 70 5 L80 40 Q40 30, 0 40 Z"
                        fill="#FBBC05"
                      />
                      <rect
                        x="25"
                        y="2"
                        width="30"
                        height="4"
                        fill="#D4AF37"
                        rx="2"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* HAND/HOLDABLE PROPS */}
                {equipped.hand === "lantern" && (
                  <motion.div
                    animate={{ rotate: [-4, 4, -4], y: [0, 1, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-5 top-8 pointer-events-none w-6 h-10 drop-shadow-lg z-28 origin-top"
                  >
                    <svg viewBox="0 0 30 50" className="w-full h-full">
                      <line
                        x1="15"
                        y1="0"
                        x2="15"
                        y2="12"
                        stroke="#4A3B32"
                        strokeWidth="2"
                      />
                      <rect
                        x="5"
                        y="12"
                        width="20"
                        height="26"
                        rx="6"
                        fill="#EA4335"
                      />
                      <rect
                        x="9"
                        y="15"
                        width="12"
                        height="20"
                        rx="3"
                        fill="#FBBC05"
                        opacity="0.8"
                      />
                      <rect x="8" y="10" width="14" height="2" fill="#4A3B32" />
                      <rect x="8" y="38" width="14" height="2" fill="#4A3B32" />
                      <line
                        x1="15"
                        y1="40"
                        x2="15"
                        y2="48"
                        stroke="#EA4335"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>
                )}

                {equipped.hand === "peach_blossom" && (
                  <motion.div
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-6 top-8 pointer-events-none w-6 h-8 z-28 origin-bottom-left text-xl select-none"
                  >
                    🎋
                  </motion.div>
                )}

                {equipped.hand === "tea_cup" && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-5 bottom-4 pointer-events-none w-6 h-6 z-28 text-sm select-none"
                  >
                    🍵
                    <div className="absolute -top-1.5 left-1 text-[8px] animate-pulse">
                      💨
                    </div>
                  </motion.div>
                )}

                {equipped.hand === "calligraphy_brush" && (
                  <motion.div
                    animate={{ rotate: [-6, 6, -6] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-4 bottom-2 pointer-events-none w-5 h-10 z-28 text-xl select-none origin-bottom"
                  >
                    🖌️
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleTickle}
                disabled={tickleCooldown}
                className={`text-xs font-extrabold px-3 py-1 bg-white border border-peach/30 rounded-full shadow-2xs hover:bg-peach/10 transition-colors flex items-center gap-1 active:scale-95 ${
                  tickleCooldown ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Smile className="w-3 h-3 text-peach" />
                {tickleCooldown ? "Satisfied!" : "Tickle & Play"}
              </button>

              <button
                onClick={() => setMusicPlaying((p) => !p)}
                className={`text-xs font-extrabold px-3 py-1 border rounded-full shadow-2xs transition-colors flex items-center gap-1 active:scale-95 ${
                  musicPlaying
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-forest border-forest/20 hover:bg-forest/5"
                }`}
              >
                <Music
                  className={`w-3 h-3 ${musicPlaying ? "animate-spin" : ""}`}
                />
                {musicPlaying ? "Stop Music" : "Dance 🎵"}
              </button>
            </div>
          </div>
        </div>

        {/* Vital Meters Panel */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <Meter
            label="Hunger"
            value={pet.hunger}
            icon={<Utensils className="w-3 h-3 text-amber-500" />}
            color="bg-amber-500"
          />
          <Meter
            label="Joy"
            value={pet.happiness}
            icon={<Heart className="w-3 h-3 text-peach" />}
            color="bg-peach"
          />
          <Meter
            label="Foliage"
            value={pet.cleanliness}
            icon={<Droplet className="w-3 h-3 text-blue-500" />}
            color="bg-blue-500"
          />
          <Meter
            label="Energy"
            value={pet.energy}
            icon={<Flame className="w-3 h-3 text-orange-500" />}
            color="bg-orange-500"
          />
        </div>

        {/* Style Rating Accent Bar */}
        <div className="mt-3 bg-gradient-to-r from-forest/5 to-transparent border-l-4 border-forest rounded-r-xl p-2.5 flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-forest/60">
              Outfit Style Standing
            </p>
            <h4
              className={`text-xs font-extrabold ${getStyleRanking().color} mt-0.5`}
            >
              {getStyleRanking().title} ({getStyleScore()} Style PTS)
            </h4>
            <p className="text-[9px] text-forest/50 font-semibold italic">
              {getStyleRanking().desc}
            </p>
          </div>
          <span className="text-xl">🤵</span>
        </div>

        {/* Interactive Tabs Menu */}
        <div className="flex border-b border-black/[0.05] mt-5 mb-4 overflow-x-auto scrollbar-none gap-1">
          <TabButton
            id="care"
            label="Care & Play"
            active={activeTab === "care"}
            onClick={setActiveTab}
            icon={<Utensils className="w-3.5 h-3.5" />}
          />
          <TabButton
            id="wardrobe"
            label="Wardrobe"
            active={activeTab === "wardrobe"}
            onClick={setActiveTab}
            icon={<Palette className="w-3.5 h-3.5" />}
          />
          <TabButton
            id="shop"
            label="Boutique"
            active={activeTab === "shop"}
            onClick={setActiveTab}
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
          />
          <TabButton
            id="garden"
            label="Eco-Garden"
            active={activeTab === "garden"}
            onClick={setActiveTab}
            icon={<Sun className="w-3.5 h-3.5" />}
          />
          <TabButton
            id="oracle"
            label="Oracle"
            active={activeTab === "oracle"}
            onClick={setActiveTab}
            icon={<Dices className="w-3.5 h-3.5" />}
          />
          <TabButton
            id="arcade"
            label="Arcade"
            active={activeTab === "arcade"}
            onClick={setActiveTab}
            icon={<Award className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Error / Success Notifications inside card */}
        {errorMsg && (
          <div className="text-[10px] text-peach bg-peach/10 border border-peach/30 p-2.5 rounded-xl mb-3 font-semibold text-center animate-shake z-10 relative">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mb-3 font-semibold text-center animate-pulse z-10 relative">
            ✨ {successMsg}
          </div>
        )}

        {/* Tabs Content Area */}
        <div className="min-h-[140px]">
          {/* TAB 1: CARE & TREATMENT */}
          {activeTab === "care" && (
            <div className="space-y-3">
              <p className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
                Feed Hong Kong Treats
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FOODS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFeed(f.id, f.cost, f.hunger, f.joy)}
                    disabled={coins < f.cost || isFeeding !== null}
                    className={`border p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all active:scale-95 duration-150 relative ${
                      coins >= f.cost
                        ? "hover:border-forest/30 cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    } ${f.color}`}
                  >
                    <span className="text-2xl mb-1">{f.emoji}</span>
                    <span className="text-[10px] font-extrabold truncate w-full">
                      {f.name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-bold opacity-80 mt-1">
                      {formatCoins(f.cost)}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleWaterGarden}
                disabled={coins < 5 || isWatering}
                className="w-full mt-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-50/80 p-3 rounded-2xl text-xs font-bold text-blue-700 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Droplet className="w-4 h-4 fill-blue-500 text-blue-500" />
                <span>Water Gardens & Sprouts ({formatCoins(5)})</span>
              </button>

              {/* Share Collection Section */}
              <div className="border-t border-black/[0.05] pt-3 mt-3">
                <p className="text-[10px] text-forest/50 font-bold uppercase tracking-wider mb-2">
                  Share Your Collection with Fahy
                </p>
                {pet.itemsOwned.length === 0 ? (
                  <div className="text-center py-4 text-[10px] font-semibold text-forest/40 bg-surface rounded-xl border border-dashed border-black/[0.05]">
                    🎒 No accessories in your collection yet. Visit the Boutique
                    Shop!
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {pet.itemsOwned.map((itemId) => {
                      const item = ACC_REGISTRY[itemId];
                      if (!item) return null;
                      return (
                        <button
                          key={itemId}
                          onClick={() => handleShareCollectionItem(itemId)}
                          className="bg-surface hover:bg-forest/5 border border-black/[0.05] rounded-xl px-3 py-2 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <div className="text-left">
                            <p className="text-[9px] font-extrabold text-forest truncate max-w-[80px]">
                              {item.name}
                            </p>
                            <p className="text-[7px] text-forest/40 font-bold">
                              Tap to Share
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACCESSORY BOUTIQUE SHOP */}
          {activeTab === "shop" && (
            <div className="space-y-3">
              {/* Horizontal Sub-categories */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 border-b border-black/[0.03]">
                {(
                  [
                    "all",
                    "head",
                    "face",
                    "body",
                    "hand",
                    "companion",
                    "background",
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShopCategory(cat)}
                    className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border transition-all shrink-0 capitalize ${
                      shopCategory === cat
                        ? "bg-forest border-forest text-white"
                        : "bg-surface border-black/5 text-forest/60 hover:bg-forest/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredShopItems.map(([id, info]) => {
                  const isOwned = pet.itemsOwned.includes(id);
                  return (
                    <div
                      key={id}
                      className="border border-black/[0.05] bg-surface rounded-2xl p-3 flex flex-col items-center justify-between text-center relative"
                    >
                      {/* Rarity Tag */}
                      <span
                        className={`absolute top-1.5 left-2 text-[6px] font-extrabold px-1 py-0.5 rounded-full uppercase ${
                          info.rarity === "Legendary"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : info.rarity === "Epic"
                              ? "bg-purple-100 text-purple-800"
                              : info.rarity === "Rare"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-black/5 text-forest/50"
                        }`}
                      >
                        {info.rarity}
                      </span>

                      <span className="text-3xl mb-1 mt-3.5 drop-shadow-sm select-none">
                        {info.emoji}
                      </span>
                      <h4 className="text-[10px] font-extrabold text-forest leading-none">
                        {info.name}
                      </h4>
                      <p className="text-[8px] text-forest/40 mt-1 line-clamp-2 leading-tight">
                        {info.desc}
                      </p>

                      <span className="text-[7px] text-forest/40 font-bold mt-1 uppercase tracking-wider">
                        +{info.stylePoints} Style PTS
                      </span>

                      <button
                        disabled={isOwned || coins < info.cost}
                        onClick={() => handleBuyAccessory(id, info.cost)}
                        className={`w-full mt-2 py-1.5 rounded-xl font-bold text-[9px] transition-colors ${
                          isOwned
                            ? "bg-forest/5 text-forest/40 cursor-default"
                            : coins >= info.cost
                              ? "bg-forest text-white hover:bg-forest/90 active:scale-95"
                              : "bg-black/5 text-forest/30 cursor-not-allowed"
                        }`}
                      >
                        {isOwned
                          ? "Purchased"
                          : `Buy ${formatCoins(info.cost)}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WARDROBE EQUIP SCREEN */}
          {activeTab === "wardrobe" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
                  Multi-Slot Closet
                </p>
                <span className="text-[9px] font-bold text-forest/40">
                  Slots: Head, Face, Body, Hand, Companion, Aura
                </span>
              </div>

              {pet.itemsOwned.length === 0 ? (
                <div className="text-center py-8 text-xs text-forest/40 font-semibold border-2 border-dashed border-black/[0.04] rounded-2xl bg-surface">
                  🎒 No accessories owned yet. Visit the Boutique!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {/* None Equip Button */}
                  <div className="border border-black/[0.05] bg-surface rounded-2xl p-2 flex flex-col justify-between">
                    <p className="text-[8px] font-bold text-forest/40 uppercase mb-1">
                      Strip Outfit
                    </p>
                    <button
                      onClick={() => {
                        const nextPet = {
                          ...pet,
                          equipped: {},
                          activeHat: null,
                        };
                        setPet(nextPet);
                        savePetState(nextPet);
                      }}
                      className="bg-black/5 hover:bg-black/10 text-forest text-[9px] py-1 rounded-xl font-bold"
                    >
                      Remove All
                    </button>
                  </div>

                  {pet.itemsOwned.map((id) => {
                    const info = ACC_REGISTRY[id];
                    if (!info) return null;
                    const isEquipped = equipped[info.slot] === id;
                    return (
                      <button
                        key={id}
                        onClick={() =>
                          handleEquipAccessory(
                            info.slot,
                            isEquipped ? null : id,
                          )
                        }
                        className={`border p-2.5 rounded-2xl flex items-center gap-2 text-left active:scale-95 transition-all ${
                          isEquipped
                            ? "border-forest bg-forest/[0.03]"
                            : "border-black/[0.05] bg-surface hover:bg-forest/5"
                        }`}
                      >
                        <span className="text-2xl shrink-0 select-none">
                          {info.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[7px] bg-black/5 text-forest/40 font-extrabold px-1 rounded uppercase">
                            {info.slot}
                          </span>
                          <p className="text-[10px] font-extrabold text-forest truncate mt-0.5">
                            {info.name}
                          </p>
                          <p className="text-[8px] text-forest/50 font-bold">
                            {isEquipped ? "Equipped" : "Wear"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ECO-GARDEN IDLE FARMING */}
          {activeTab === "garden" && (
            <div className="space-y-4">
              <p className="text-[10px] text-forest/50 font-bold uppercase tracking-wider">
                Fa Hui Digital Allotment Plot
              </p>

              {!pet.gardenPlot || !pet.gardenPlot.type ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Banyan Seed Option */}
                  <div className="border border-black/[0.05] bg-surface rounded-2xl p-4 text-center flex flex-col justify-between">
                    <span className="text-3xl mb-1 select-none">🌱</span>
                    <h4 className="font-display font-bold text-xs text-forest">
                      Banyan Tree Seed
                    </h4>
                    <p className="text-[8px] text-forest/50 my-1 leading-normal font-semibold">
                      Harvest yield: 40 Coins
                      <br />
                      XP Gain: +15 XP
                    </p>
                    <button
                      onClick={() => handlePlantSeed("banyan")}
                      className="bg-forest text-white font-extrabold text-[10px] py-2 rounded-xl mt-2 hover:bg-forest/90"
                    >
                      Plant ({formatCoins(15)})
                    </button>
                  </div>

                  {/* Peach Seed Option */}
                  <div className="border border-black/[0.05] bg-surface rounded-2xl p-4 text-center flex flex-col justify-between">
                    <span className="text-3xl mb-1 select-none">🍑</span>
                    <h4 className="font-display font-bold text-xs text-forest">
                      Lucky Peach Pit
                    </h4>
                    <p className="text-[8px] text-forest/50 my-1 leading-normal font-semibold">
                      Harvest yield: 75 Coins
                      <br />
                      XP Gain: +30 XP
                    </p>
                    <button
                      onClick={() => handlePlantSeed("peach")}
                      className="bg-forest text-white font-extrabold text-[10px] py-2 rounded-xl mt-2 hover:bg-forest/90"
                    >
                      Plant ({formatCoins(30)})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-4">
                  {/* Plant visual progress based on growth percent */}
                  <div className="text-4xl w-14 h-14 bg-white rounded-2xl border border-black/5 flex items-center justify-center select-none shadow-xs">
                    {pet.gardenPlot.growth >= 100
                      ? pet.gardenPlot.type === "banyan"
                        ? "🌳"
                        : "🍑"
                      : pet.gardenPlot.growth >= 60
                        ? "🌿"
                        : pet.gardenPlot.growth >= 30
                          ? "🌱"
                          : "🪵"}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold leading-none">
                      <span className="capitalize">
                        {pet.gardenPlot.type} Plant
                      </span>
                      <span className="text-emerald-600">
                        {pet.gardenPlot.growth}% Mature
                      </span>
                    </div>

                    {/* Growth Progress Slider */}
                    <div className="w-full h-2 bg-black/[0.05] rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pet.gardenPlot.growth}%` }}
                      />
                    </div>

                    <p className="text-[8px] text-forest/50 font-bold leading-normal">
                      Watered {pet.gardenPlot.wateredCount} times. Each water
                      boosts maturity by 20%!
                    </p>

                    <div className="flex gap-2 pt-1">
                      {pet.gardenPlot.growth < 100 ? (
                        <button
                          onClick={handleWaterCrop}
                          className="flex-1 bg-blue-600 text-white font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-blue-700 active:scale-95 transition-transform"
                        >
                          <Droplet className="w-3 h-3 fill-white" />
                          <span>Water Crop ({formatCoins(4)})</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleHarvestCrop}
                          className="flex-1 bg-emerald-600 text-white font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-700 animate-bounce active:scale-95 transition-all"
                        >
                          <span>Harvest & Cash Reward</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DAILY BAMBOO ORACLE FORTUNES */}
          {activeTab === "oracle" && (
            <div className="space-y-4 text-center">
              <p className="text-[10px] text-forest/50 font-bold uppercase tracking-wider text-left">
                Daily Bamboo Oracle (求籤)
              </p>

              <AnimatePresence mode="wait">
                {oracleState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-2"
                  >
                    <div className="text-4xl animate-bounce mb-2">🏮</div>
                    <h4 className="font-display font-extrabold text-sm text-forest">
                      What is Fahy's Fortune today?
                    </h4>
                    <p className="text-[10px] text-forest/50 max-w-xs mx-auto mt-1 leading-normal font-semibold">
                      Shake the sacred bamboo container to fall a random daily
                      stick containing blessings and Peach Coin cash rewards!
                    </p>

                    <button
                      onClick={handleShakeOracle}
                      disabled={hasShakenToday}
                      className="mt-4 bg-forest text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-forest/90 active:scale-95 transition-transform"
                    >
                      {hasShakenToday
                        ? "Oracle Shaken Today"
                        : "Shake Oracle Cup (Free)"}
                    </button>
                  </motion.div>
                )}

                {oracleState === "shaking" && (
                  <motion.div
                    key="shaking"
                    animate={{
                      rotate: [-15, 15, -15, 15, -15, 15, 0],
                      y: [0, -5, 0, -5, 0],
                    }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                    className="py-6 flex flex-col items-center justify-center"
                  >
                    <span className="text-5xl animate-pulse">🎋</span>
                    <p className="text-[9px] uppercase font-bold text-forest/40 tracking-widest mt-4">
                      🥁 Ruffling lucky bamboo splits...
                    </p>
                  </motion.div>
                )}

                {oracleState === "revealed" && (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-4 text-center space-y-2"
                  >
                    <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full uppercase">
                      {luckLevel}
                    </span>

                    <h4 className="font-display font-bold text-sm text-yellow-900 mt-1">
                      "Oracle Declares:"
                    </h4>
                    <p className="text-xs font-medium text-forest/80 leading-relaxed max-w-sm italic">
                      {fortuneText}
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => setOracleState("idle")}
                        className="border border-black/10 bg-white hover:bg-surface text-forest font-bold text-[10px] px-4 py-1.5 rounded-full"
                      >
                        Receive Blessings
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 6: ARCADE COIN CATCHER GAME */}
          {activeTab === "arcade" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-forest/50">
                <span>Fahy's Bloom-Catching Arcade</span>
                {arcadeState === "playing" && (
                  <span className="text-red-500 animate-ping">
                    🔴 TIME: {arcadeTimer}s
                  </span>
                )}
              </div>

              {arcadeState === "idle" && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2 select-none">🎮</div>
                  <h4 className="font-display font-bold text-sm text-forest">
                    Bloom Catcher Minigame
                  </h4>
                  <p className="text-[9px] text-forest/50 max-w-xs mx-auto leading-relaxed mt-1">
                    Drag the slider or use buttons below to slide Fahy left and
                    right. Catch dropping 🪙 coins and 🌸 blooms. Avoid toxic 🪰
                    trash!
                  </p>
                  <button
                    onClick={startArcadeGame}
                    className="bg-forest hover:bg-forest/90 text-white font-bold text-xs px-6 py-2.5 rounded-full mt-4 active:scale-95 transition-transform"
                  >
                    Insert Coin & Play
                  </button>
                </div>
              )}

              {arcadeState === "playing" && (
                <div className="space-y-3">
                  {/* Score panel */}
                  <div className="flex justify-between items-center bg-surface border border-black/[0.03] px-3 py-1.5 rounded-xl text-xs font-bold">
                    <span>Score: {arcadeScore} PTS</span>
                    <span className="text-emerald-600">
                      Earnings: +{formatCoins(arcadeCoinsEarned)}
                    </span>
                  </div>

                  {/* Simulated game viewport */}
                  <div className="bg-slate-900 aspect-[16/7] rounded-2xl relative overflow-hidden border border-black/15">
                    {/* Dynamic background lights */}
                    <div className="absolute top-2 left-4 text-xs font-mono text-white/10">
                      COSMIC_STAGE_01
                    </div>

                    {/* Items falling down */}
                    {droppingItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="absolute text-xl select-none"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {item.emoji}
                      </motion.div>
                    ))}

                    {/* Fahy Avatar sliding catcher */}
                    <div
                      className="absolute bottom-1 w-12 h-12 flex items-center justify-center transition-all duration-75"
                      style={{
                        left: `${catcherX}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <PixelFahy
                        level={level}
                        size={42}
                        interactive={false}
                        className="animate-wiggle"
                      />
                    </div>
                  </div>

                  {/* Slide controller */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <button
                        onClick={() => setCatcherX((x) => Math.max(5, x - 15))}
                        className="bg-forest hover:bg-forest/95 text-white font-extrabold text-xs px-4 py-2 rounded-xl active:scale-95"
                      >
                        ◀ Slide Left
                      </button>
                      <span className="text-[9px] text-forest/40 uppercase font-bold">
                        Position slider
                      </span>
                      <button
                        onClick={() => setCatcherX((x) => Math.min(95, x + 15))}
                        className="bg-forest hover:bg-forest/95 text-white font-extrabold text-xs px-4 py-2 rounded-xl active:scale-95"
                      >
                        Slide Right ▶
                      </button>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={catcherX}
                      onChange={(e) => setCatcherX(parseInt(e.target.value))}
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {arcadeState === "game_over" && (
                <div className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-forest">
                    Arcade Harvest Complete!
                  </h4>
                  <p className="text-xs text-forest/60">
                    Your coordination locks secured:
                  </p>

                  <div className="bg-fahy-yellow/15 border border-fahy-yellow/20 rounded-2xl p-3 flex justify-around font-bold text-xs max-w-xs mx-auto">
                    <div>
                      <p className="text-[8px] uppercase text-forest/40">
                        Peach Coins
                      </p>
                      <p className="text-sm font-extrabold">
                        +{formatCoins(arcadeCoinsEarned)}
                      </p>
                    </div>
                    <div className="w-px h-6 bg-forest/10" />
                    <div>
                      <p className="text-[8px] uppercase text-forest/40">
                        Points Gain
                      </p>
                      <p className="text-sm font-extrabold">
                        +{arcadeScore * 3} PTS
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setArcadeState("idle")}
                      className="bg-forest text-white font-bold text-xs px-5 py-2 rounded-full"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-2 border border-black/[0.03] flex flex-col justify-between">
      <div className="flex items-center gap-1 mb-1.5">
        {icon}
        <span className="text-[9px] font-bold text-forest/55 leading-none">
          {label}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-extrabold mb-1">{value}%</p>
        <div className="h-1 bg-black/[0.05] rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  id: "care" | "shop" | "wardrobe" | "garden" | "arcade" | "oracle";
  label: string;
  active: boolean;
  onClick: (
    id: "care" | "shop" | "wardrobe" | "garden" | "arcade" | "oracle",
  ) => void;
  icon: React.ReactNode;
}

function TabButton({ id, label, active, onClick, icon }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all shrink-0 ${
        active
          ? "border-forest text-forest font-extrabold"
          : "border-transparent text-forest/50 hover:text-forest"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
