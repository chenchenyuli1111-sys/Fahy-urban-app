import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLang, LANGUAGES } from "@/lib/i18n";
import { Check, Globe, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — The Fahy Hub" },
      { name: "description", content: "Language and preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { lang, setLang, k, formatCoins } = useLang();
  const { user, logout, updateProfileData } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfileData(username, photoURL);
      alert("Profile updated successfully!");
    } catch (e) {
      alert("Failed to update profile.");
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
          {k("settings.tag")}
        </p>
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-3xl tracking-tight">
            {k("settings.title")}
          </h1>
        </div>
      </header>

      {user && (
        <section className="px-5 mt-4 space-y-4">
          <Link
            to="/dashboard"
            className="w-full bg-forest text-white font-bold text-sm px-6 py-4 rounded-3xl flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-sm"
          >
            <UserIcon className="w-4 h-4 text-fahy-yellow" />
            Go to My Profile Dashboard
          </Link>

          <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-4 h-4 text-peach" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-forest/60">
                Profile
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest/70 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest/70 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full bg-surface border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-forest"
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full bg-peach text-white font-bold text-sm px-6 py-3 rounded-full active:scale-95 transition-transform"
              >
                Save Profile
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="px-5 mt-6">
        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-sage-deep" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-forest/60">
              {k("settings.language")}
            </p>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((l) => {
              const active = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors active:scale-[0.99] ${
                    active
                      ? "bg-forest text-white border-forest"
                      : "bg-surface border-black/5 text-forest"
                  }`}
                >
                  <div className="text-left flex items-center gap-3">
                    <span className="text-xl leading-none">{l.flag}</span>
                    <div>
                      <p className="font-bold text-sm">{l.native}</p>
                      <p
                        className={`text-[11px] ${active ? "text-white/70" : "text-forest/50"}`}
                      >
                        {l.label} · {l.coin}
                      </p>
                    </div>
                  </div>
                  {active && (
                    <Check
                      className="w-4 h-4 text-fahy-yellow"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {user && (
        <section className="px-5 mt-6 mb-12">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold px-6 py-4 rounded-3xl flex justify-center items-center gap-2 active:scale-95 transition-transform"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </section>
      )}
    </AppShell>
  );
}
