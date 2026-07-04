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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileData: (displayName: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      const isAuthRoute =
        routerState.location.pathname === "/login" ||
        routerState.location.pathname === "/signup" ||
        routerState.location.pathname === "/reset-password";

      if (!currentUser && !isAuthRoute) {
        navigate({ to: "/login" });
      } else if (currentUser && isAuthRoute) {
        navigate({ to: "/" });
      }
    });

    return unsubscribe;
  }, [navigate, routerState.location.pathname]);

  const logout = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  const updateProfileData = async (displayName: string, photoURL: string) => {
    if (!auth.currentUser) return;

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
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfileData }}>
      {children}
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
