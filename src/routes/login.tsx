import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — The Fahy Hub" }],
  }),
  component: Login,
});

function Login() {
  const { k } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialLogin = async (
    providerName: "google" | "apple" | "facebook",
  ) => {
    setLoading(true);
    setError("");
    try {
      let provider;
      if (providerName === "google") {
        provider = new GoogleAuthProvider();
      } else if (providerName === "apple") {
        provider = new OAuthProvider("apple.com");
      } else {
        provider = new FacebookAuthProvider();
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it (in case they login without signing up first)
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          username:
            user.displayName || user.email?.split("@")[0] || "Eco Explorer",
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
          points: 0,
          coins: 0,
          xp: 0,
          level: 1,
        });
      }

      navigate({ to: "/" });
    } catch (err: any) {
      console.error(`${providerName} login error:`, err);
      if (
        err.code === "auth/operation-not-supported-in-this-environment" ||
        err.code === "auth/auth-domain-config-required"
      ) {
        setError(
          "To use social login, please open this app in a new tab (click the ↗ icon in the top right of the preview).",
        );
      } else if (
        err.code === "auth/configuration-not-found" ||
        err.message.includes("configuration")
      ) {
        setError(
          `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} login is not enabled. You must configure this provider in your Firebase Console Authentication settings.`,
        );
      } else {
        setError(err.message || `Failed to log in with ${providerName}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("EMAIL_NOT_ENABLED");
      } else {
        setError(err.message || "Failed to log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <header className="px-5 pt-10 pb-4">
        <h1 className="font-display font-bold text-3xl tracking-tight">
          Welcome Back
        </h1>
        <p className="text-forest/60 text-sm mt-2">
          Log in to track your Fahy journey
        </p>
      </header>

      <section className="px-5 mt-8">
        <form className="space-y-4" onSubmit={handleLogin}>
          {error &&
            (error === "EMAIL_NOT_ENABLED" ? (
              <div className="bg-peach/10 border border-peach rounded-2xl p-4 text-forest text-xs space-y-2.5">
                <p className="font-bold text-peach text-sm">
                  📧 Email/Password Auth Disabled
                </p>
                <p className="leading-relaxed text-forest/80">
                  Email & Password sign-in has not been enabled in this Firebase
                  project yet.
                </p>
                <p className="leading-relaxed font-semibold text-forest/95">
                  How to fix:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-forest/80">
                  <li>
                    Open the{" "}
                    <a
                      href="https://console.firebase.google.com/project/urban-planner-494613/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-deep font-bold underline hover:text-forest"
                    >
                      Firebase Console Auth Settings
                    </a>
                    .
                  </li>
                  <li>
                    Click <strong>Add new provider</strong> and choose{" "}
                    <strong>Email/Password</strong>.
                  </li>
                  <li>
                    Toggle <strong>Enable</strong> and click{" "}
                    <strong>Save</strong>.
                  </li>
                </ol>
                <p className="text-[11px] text-sage-deep font-bold pt-1">
                  💡 Alternatively, you can use Google Sign-In below, which is
                  enabled by default!
                </p>
              </div>
            ) : (
              <div className="bg-peach/10 border border-peach text-peach text-xs font-bold p-3 rounded-2xl">
                {error}
              </div>
            ))}
          <div>
            <label className="text-[10px] uppercase font-bold text-forest/70 ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 mt-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-deep/50"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-forest/70 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 mt-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-deep/50"
              required
            />
          </div>

          <div className="flex justify-end">
            <a
              href="/reset-password"
              className="text-xs font-bold text-sage-deep"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white rounded-full py-3.5 font-bold mt-4 active:scale-95 transition-transform disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-50 px-3 text-forest/50 font-bold uppercase tracking-widest">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="w-full bg-white border border-black/10 text-forest rounded-full py-3 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
          >
            <FcGoogle className="w-5 h-5" /> Google
          </button>
        </div>

        <div className="mt-8 text-center pb-8">
          <p className="text-xs text-forest/60">
            Don't have an account?{" "}
            <a href="/signup" className="font-bold text-forest underline">
              Sign up
            </a>
          </p>
        </div>
      </section>
    </AppShell>
  );
}
