import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// Types for Firestore Data
export interface NeighborhoodMetrics {
  aqi: number;
  aqiStatus: string;
  crowd: string;
  crowdStatus: string;
  noise: string;
  noiseStatus: string;
}

export interface Workshop {
  id: number;
  title: string;
  org: string;
  category: string;
  date: string;
  location: string;
  spots: number;
  reward: number;
  participants: string[];
}

export interface Report {
  id?: string;
  userId: string;
  imageUrl: string;
  issueType: string;
  description: string;
  lat: number;
  lng: number;
  restored: boolean;
  status?: string;
  timestamp: unknown;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  level: number;
  isMe: boolean;
  photoURL?: string;
  uid: string;
}

// ------------------------------
// 1. NEIGHBORHOOD METRICS SERVICE
// ------------------------------

const METRICS_DOC_ID = "fahui_park_live";

/**
 * Subscribes to real-time neighborhood metrics.
 * If metrics do not exist, it initializes them with default live data.
 */
export function subscribeToMetrics(
  onUpdate: (metrics: NeighborhoodMetrics) => void,
): () => void {
  const docRef = doc(db, "metrics", METRICS_DOC_ID);

  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as NeighborhoodMetrics);
    } else {
      // Initialize if not present
      const defaultMetrics: NeighborhoodMetrics = {
        aqi: 24,
        aqiStatus: "Excellent",
        crowd: "Moderate",
        crowdStatus: "Peaceful",
        noise: "42dB",
        noiseStatus: "Quiet",
      };
      setDoc(docRef, defaultMetrics);
      onUpdate(defaultMetrics);
    }
  });
}

/**
 * Updates dynamic neighborhood metrics.
 */
export async function updateMetrics(
  metrics: Partial<NeighborhoodMetrics>,
): Promise<void> {
  const docRef = doc(db, "metrics", METRICS_DOC_ID);
  await updateDoc(docRef, metrics);
}

// ------------------------------
// 2. WORKSHOPS SERVICE
// ------------------------------

const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 1,
    title: "Plastic Bottle Planters",
    org: "Eco-Art HK",
    category: "Upcycling Art",
    date: "Sat, Oct 14 • 2:00 PM",
    location: "Fa Hui Park Community Center",
    spots: 5,
    reward: 50,
    participants: [],
  },
  {
    id: 2,
    title: "Urban Composting 101",
    org: "Green Neighbors",
    category: "Gardening",
    date: "Sun, Oct 15 • 10:00 AM",
    location: "Community Garden West",
    spots: 12,
    reward: 30,
    participants: [],
  },
  {
    id: 3,
    title: "Local Flora Identification",
    org: "Nature Watchers",
    category: "Education",
    date: "Sat, Oct 21 • 9:00 AM",
    location: "Fa Hui Park Trailhead",
    spots: 20,
    reward: 40,
    participants: [],
  },
];

/**
 * Subscribes to workshops in real-time.
 * Populates initial workshops if the collection is empty.
 */
export function subscribeToWorkshops(
  onUpdate: (workshops: Workshop[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const collRef = collection(db, "workshops");

  return onSnapshot(
    collRef,
    (snap) => {
      if (snap.empty) {
        // Seed initial workshops
        INITIAL_WORKSHOPS.forEach((w) => {
          setDoc(doc(db, "workshops", String(w.id)), w);
        });
      } else {
        const list = snap.docs.map((doc) => doc.data() as Workshop);
        // Sort by ID
        list.sort((a, b) => a.id - b.id);
        onUpdate(list);
      }
    },
    (err) => {
      console.error("Firestore workshops snapshot error:", err);
      if (onError) onError(err);
    },
  );
}

/**
 * Enrolls a user in a workshop.
 */
export async function enrollInWorkshop(
  workshopId: number,
  userId: string,
): Promise<void> {
  const docRef = doc(db, "workshops", String(workshopId));
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const w = snap.data() as Workshop;
    if (w.spots > 0 && !w.participants.includes(userId)) {
      await updateDoc(docRef, {
        spots: w.spots - 1,
        participants: arrayUnion(userId),
      });
    }
  }
}

// ------------------------------
// 3. REPORTS SERVICE
// ------------------------------

/**
 * Subscribes to environmental reports ordered by date.
 */
export function subscribeToReports(
  onUpdate: (reports: Report[]) => void,
): () => void {
  const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => {
    const reportsList = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Report[];
    onUpdate(reportsList);
  });
}

/**
 * Submits a new eco-report.
 */
export async function createReport(
  report: Omit<Report, "timestamp">,
): Promise<string> {
  const collRef = collection(db, "reports");
  const docRef = await addDoc(collRef, {
    ...report,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

// ------------------------------
// 4. LEADERBOARD SERVICE
// ------------------------------

/**
 * Fetches current leaderboard ranking.
 */
export async function fetchLeaderboard(
  currentUserId: string | undefined,
  sortBy: "points" | "level",
  limitCount: number = 10,
): Promise<LeaderboardUser[]> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy(sortBy, "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  const fetchedUsers = snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      rank: index + 1,
      name: data.username || "Anonymous",
      score: sortBy === "points" ? data.points || 0 : data.level || 1,
      level: data.level || 1,
      isMe: currentUserId ? doc.id === currentUserId : false,
      photoURL: data.photoURL,
      uid: doc.id,
    };
  });

  // If current user is not in the top 10, find their exact ranking
  if (currentUserId && !fetchedUsers.some((u) => u.isMe)) {
    const allQuery = query(usersRef, orderBy(sortBy, "desc"));
    const allDocs = await getDocs(allQuery);
    const userIndex = allDocs.docs.findIndex((d) => d.id === currentUserId);

    if (userIndex !== -1) {
      const data = allDocs.docs[userIndex].data();
      fetchedUsers.push({
        rank: userIndex + 1,
        name: data.username || "Anonymous",
        score: sortBy === "points" ? data.points || 0 : data.level || 1,
        level: data.level || 1,
        isMe: true,
        photoURL: data.photoURL,
        uid: currentUserId,
      });
    }
  }

  return fetchedUsers;
}

// ------------------------------
// 5. USER PROFILE SERVICE
// ------------------------------

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  coins: number;
  xp: number;
  level: number;
  points: number;
  badges?: string[];
  equippedBadge?: string;
  photoURL?: string;
  bio?: string;
  locationPreference?: string;
}

/**
 * Fetches user profile data from Firestore.
 */
export async function fetchUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      uid,
      username: data.username || "Anonymous",
      email: data.email || "",
      coins: data.coins || 0,
      xp: data.xp || 0,
      level: data.level || 1,
      points: data.points || 0,
      badges: data.badges || [],
      equippedBadge: data.equippedBadge || "",
      photoURL: data.photoURL || "",
      bio: data.bio || "",
      locationPreference: data.locationPreference || "",
    };
  }
  return null;
}

/**
 * Subscribes to user profile data changes.
 */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: UserProfile) => void,
): () => void {
  const docRef = doc(db, "users", uid);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate({
        uid,
        username: data.username || "Anonymous",
        email: data.email || "",
        coins: data.coins || 0,
        xp: data.xp || 0,
        level: data.level || 1,
        points: data.points || 0,
        badges: data.badges || [],
        equippedBadge: data.equippedBadge || "",
        photoURL: data.photoURL || "",
        bio: data.bio || "",
        locationPreference: data.locationPreference || "",
      });
    }
  });
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(
  uid: string,
  profile: Partial<Omit<UserProfile, "uid">>,
): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, profile);
}

// ------------------------------
// 6. URBAN INSIGHTS SERVICE
// ------------------------------

export interface UrbanInsight {
  id?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  readTime: string;
  likes: number;
  imageUrl?: string;
  publishedAt?: unknown;
}

const INITIAL_INSIGHTS: Omit<UrbanInsight, "id" | "publishedAt" | "likes">[] = [
  {
    title: "Micro-climatic Buffering in Fa Hui Park",
    category: "Ecological",
    summary:
      "How the canopy layer in Fa Hui Park offsets Mong Kok's extreme urban heat island effect.",
    content:
      "Our neighborhood park acts as a natural cooling oasis. Analysis of sensory telemetry shows that local temperatures within Fa Hui's inner loop stay 2.4°C cooler on average than surrounding commercial corridors, providing vital refuge for local bird species and active morning walkers.",
    author: "Eco-Council Research Team",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Traditional Dyeing & Soil Health Restoration",
    category: "Culture",
    summary:
      "Reclaiming wastewater from natural indigo vat fermentation to fertilize community garden beds.",
    content:
      "Traditional fermentation vats used in old-town indigo dye workshops contain rich microbial populations. Modern studies confirm that when neutralized and diluted, this organic dye run-off introduces safe bio-nutrients to our urban soil, speeding up local composting cycles by nearly 18%.",
    author: "Heritage Preservation Lab",
    readTime: "4 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Silent Streets: Designing Quiet Alleyways",
    category: "Acoustic",
    summary:
      "Understanding decibel reduction strategies using bamboo structures and vertical foliage.",
    content:
      "Fa Hui's narrow streets suffer from heavy urban echoes. By positioning custom modular bamboo weaving frames along exterior residential walls, community groups have successfully reduced decibel resonance from traffic by 4-6dB, establishing quiet resting pockets for residents.",
    author: "Urban Design Collective",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
];

/**
 * Subscribes to dynamic urban insights/stories.
 * Populates initial insights if the collection is empty.
 */
export function subscribeToUrbanInsights(
  onUpdate: (insights: UrbanInsight[]) => void,
): () => void {
  const collRef = collection(db, "insights");

  return onSnapshot(collRef, (snap) => {
    if (snap.empty) {
      // Seed initial insights
      INITIAL_INSIGHTS.forEach(async (insight, idx) => {
        await setDoc(doc(db, "insights", `insight_${idx + 1}`), {
          ...insight,
          likes: Math.floor(Math.random() * 20) + 5,
          publishedAt: serverTimestamp(),
        });
      });
    } else {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UrbanInsight[];
      onUpdate(list);
    }
  });
}

/**
 * Submits a new community/urban insight.
 */
export async function createUrbanInsight(
  insight: Omit<UrbanInsight, "id" | "publishedAt" | "likes">,
): Promise<string> {
  const collRef = collection(db, "insights");
  const docRef = await addDoc(collRef, {
    ...insight,
    likes: 0,
    publishedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Likes/Upvotes an urban insight.
 */
export async function likeUrbanInsight(insightId: string): Promise<void> {
  const docRef = doc(db, "insights", insightId);
  await updateDoc(docRef, {
    likes: increment(1),
  });
}
