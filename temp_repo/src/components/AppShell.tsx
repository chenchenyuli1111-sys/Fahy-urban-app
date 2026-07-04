import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface min-h-screen font-body text-forest">
      <div className="max-w-[480px] mx-auto pb-28 relative overflow-x-hidden animate-fade-in">
        {children}
        <Link
          to="/settings"
          aria-label="Settings"
          className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-black/5 shadow-sm grid place-items-center text-forest active:scale-95 transition-transform"
        >
          <SettingsIcon className="w-4 h-4" strokeWidth={2.4} />
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
