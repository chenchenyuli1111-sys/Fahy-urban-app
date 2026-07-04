import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password — The Fahy Hub" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { k } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link sent to your email!");
    } catch (err: any) {
      console.error("Reset error:", err);
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <header className="px-5 pt-10 pb-4 relative">
        <a href="/login" className="absolute top-10 left-5 text-forest/50">
          <ArrowLeft className="w-6 h-6" />
        </a>
        <h1 className="font-display font-bold text-3xl tracking-tight mt-10">
          Reset Password
        </h1>
        <p className="text-forest/60 text-sm mt-2">
          Enter your email and we'll send you a reset link.
        </p>
      </header>

      <section className="px-5 mt-6">
        <form className="space-y-4" onSubmit={handleReset}>
          {error && (
            <div className="bg-peach/10 border border-peach text-peach text-xs font-bold p-3 rounded-2xl">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-sage/20 border border-sage-deep text-forest text-xs font-bold p-3 rounded-2xl">
              {message}
            </div>
          )}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white rounded-full py-3.5 font-bold mt-4 active:scale-95 transition-transform disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
