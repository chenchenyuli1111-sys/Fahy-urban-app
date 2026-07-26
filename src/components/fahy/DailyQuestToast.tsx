import React from "react";
import { useDailyQuests } from "@/lib/DailyQuestContext";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DailyQuestToast() {
  const { toastMessage, dismissToast } = useDailyQuests();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-forest/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-fahy-yellow animate-pulse" />
          </div>
          <p className="text-xs font-semibold leading-tight line-clamp-2 text-white/90">
            {toastMessage}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/tasks"
            onClick={dismissToast}
            className="px-2.5 py-1 bg-fahy-yellow text-forest text-[11px] font-bold rounded-lg flex items-center gap-0.5 hover:brightness-110 active:scale-95 transition-all"
          >
            Quests <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={dismissToast}
            className="p-1 text-white/60 hover:text-white rounded-lg active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
