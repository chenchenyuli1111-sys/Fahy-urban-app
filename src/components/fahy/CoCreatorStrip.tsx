import { useLang } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

export function CoCreatorStrip() {
  const { k } = useLang();
  return (
    <Link
      to="/leaderboard"
      className="block mx-5 mb-6 bg-gradient-to-r from-sage/30 to-peach/30 rounded-3xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="flex -space-x-2">
        {["bg-peach", "bg-sage-deep", "bg-fahy-yellow", "bg-forest"].map(
          (c, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full ${c} ring-2 ring-white text-[9px] font-bold text-white grid place-items-center`}
            >
              {["A", "L", "M", "+8"][i]}
            </div>
          ),
        )}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50">
          {k("home.cocreator.tag")}
        </p>
        <p className="text-xs font-semibold">{k("home.cocreator.body")}</p>
      </div>
    </Link>
  );
}
