import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  User,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import { PixelFahy } from "@/components/fahy/PixelFahy";

function RetroLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const loadingTips = [
    "Summoning Fahy from the sacred sprout...",
    "Polishing Peach Coins...",
    "Sprouting some eco-garden seeds...",
    "Watering the community banyan trees...",
    "Polishing co-creator digital artboards...",
    "Analyzing Eco-Radar coordinates...",
    "Powering up Fahy Deck v2.0 console...",
    "Consulting with the Peach Oracle...",
    "Readying the Artisan pottery wheel...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 200);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-[#FFF5F2] via-[#FDFCFB] to-[#EBF9F5] p-4 font-sans select-none overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#b2e2d2_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm bg-gradient-to-b from-[#2d4f3c] via-[#243e2f] to-[#16271e] border-4 border-[#1c3226] rounded-[36px] p-5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none transform -skew-y-6 origin-top-left z-20" />

        <div className="flex items-center justify-between mb-3 px-1 text-white">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-display font-black text-[10px] uppercase tracking-wider text-yellow-400">
              FAHY DECK
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wide">
              POWER
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute right-6" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="bg-[#FDFCFB] border-4 border-[#16271e] rounded-2xl p-5 shadow-inner relative overflow-hidden flex flex-col items-center text-forest">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.04)_50%)] pointer-events-none z-10 [background-size:100%_4px]" />

          <div className="relative mb-5 mt-1 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute w-20 h-20 rounded-full bg-emerald-400/5 blur-lg flex items-center justify-center"
            />

            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="z-10"
            >
              <PixelFahy
                evolution="ecosystem_guardian"
                size={80}
                interactive={false}
              />
            </motion.div>

            <div className="absolute -top-1 -right-1 animate-pulse text-yellow-500 text-lg">
              ✨
            </div>
            <div
              className="absolute -bottom-1 -left-1 animate-bounce text-emerald-600 text-sm"
              style={{ animationDelay: "0.3s" }}
            >
              🌱
            </div>
          </div>

          <div className="text-center w-full min-h-[40px] flex items-center justify-center px-2 mb-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] font-sans font-bold text-[#2d4f3c] uppercase tracking-wide leading-relaxed"
              >
                {loadingTips[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="w-full bg-emerald-50/80 border border-emerald-100 rounded-full h-3.5 p-0.5 overflow-hidden relative flex items-center">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-[#F3C453] rounded-full relative"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-white/20 rounded-full" />
            </motion.div>

            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-black text-emerald-800 uppercase">
              BOOTING... {progress}%
            </span>
          </div>

          <div className="w-full flex justify-between mt-5 pt-2 border-t border-emerald-100 text-[8px] font-mono text-emerald-700/60 uppercase">
            <span>SYS_OK</span>
            <span className="animate-pulse">ONLINE</span>
            <span>PORT_3000</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center px-1 opacity-75">
          <div className="relative w-10 h-10">
            <div className="absolute top-3.5 left-0 w-10 h-3 bg-white/10 rounded-sm" />
            <div className="absolute top-0 left-3.5 w-3 h-10 bg-white/10 rounded-sm" />
          </div>

          <div className="flex gap-0.5 rotate-12">
            <div className="w-1 h-4 bg-white/10 rounded-full" />
            <div className="w-1 h-4 bg-white/10 rounded-full" />
            <div className="w-1 h-4 bg-white/10 rounded-full" />
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-rose-600 border border-rose-500 shadow-md" />
              <span className="text-[7px] font-bold text-white/60 mt-0.5">
                B
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-300 shadow-md" />
              <span className="text-[7px] font-bold text-white/60 mt-0.5">
                A
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileData: (displayName: string, photoURL: string) => Promise<void>;
  loginAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const localGuest = localStorage.getItem("fahy_local_guest");
        if (localGuest) {
          try {
            setUser(JSON.parse(localGuest));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;

    const pathname = routerState.location.pathname;
    const isAuthRoute =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/reset-password";

    if (!user && !isAuthRoute) {
      navigate({ to: "/login" });
    } else if (user && isAuthRoute) {
      navigate({ to: "/" });
    }
  }, [user, loading, routerState.location.pathname, navigate]);

  const loginAsGuest = async () => {
    let guestUid = localStorage.getItem("fahy_local_guest_uid");
    if (!guestUid) {
      guestUid = "guest_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("fahy_local_guest_uid", guestUid);
    }
    const guestUser = {
      uid: guestUid,
      displayName: "Guest Fahy Explorer",
      email: "guest@fahy.local",
      photoURL: "",
      isAnonymous: true,
    };
    localStorage.setItem("fahy_local_guest", JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("fahy_local_guest");
    localStorage.removeItem("fahy_local_guest_uid");
    setUser(null);
    navigate({ to: "/login" });
  };

  const updateProfileData = async (displayName: string, photoURL: string) => {
    if (auth.currentUser) {
      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL,
      });

      // Update Firestore User Document
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        username: displayName,
        photoURL: photoURL,
      });

      // Force refresh user state by manually updating
      setUser({ ...auth.currentUser });
    } else {
      const localGuestStr = localStorage.getItem("fahy_local_guest");
      if (localGuestStr) {
        try {
          const localGuest = JSON.parse(localGuestStr);
          localGuest.displayName = displayName;
          localGuest.photoURL = photoURL;
          localStorage.setItem("fahy_local_guest", JSON.stringify(localGuest));

          // Update Firestore User Document
          const userRef = doc(db, "users", localGuest.uid);
          await updateDoc(userRef, {
            username: displayName,
            photoURL: photoURL,
          });

          setUser(localGuest);
        } catch (e) {
          console.error("Failed to update local guest profile:", e);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, updateProfileData, loginAsGuest }}
    >
      {loading ? <RetroLoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
