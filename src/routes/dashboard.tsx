import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { UserDashboard } from "@/components/UserDashboard";
import { ArrowLeft, Settings, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Profile Dashboard — The Fahy Hub" },
      {
        name: "description",
        content:
          "View personalized stats, level progress, and earned artisan badges.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest active:scale-95 transition-transform"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-forest/50">
              Personal Area
            </p>
            <h1 className="font-display font-bold text-3xl tracking-tight leading-none">
              My Dashboard
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/evolution"
            className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-forest transition-colors active:scale-95"
            title="Evolution Tree"
          >
            <Award className="w-4 h-4" />
          </Link>
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-forest transition-colors active:scale-95"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <main className="px-5 pb-16">
        <UserDashboard />
      </main>
    </AppShell>
  );
}
