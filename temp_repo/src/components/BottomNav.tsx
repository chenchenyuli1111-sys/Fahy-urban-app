import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, BookUser, Coins, AlertTriangle } from "lucide-react";
import { useLang, type DictKey } from "@/lib/i18n";

const items = [
  { to: "/", key: "nav.hub" as DictKey, Icon: Home },
  { to: "/ecosystem", key: "nav.eco" as DictKey, Icon: Map },
  { to: "/culture", key: "nav.path" as DictKey, Icon: BookUser },
  { to: "/wallet", key: "nav.coin" as DictKey, Icon: Coins },
  { to: "/report", key: "nav.report" as DictKey, Icon: AlertTriangle },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { k } = useLang();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-black/5 px-2 pt-3 pb-6 flex justify-between items-center max-w-[480px] mx-auto">
      {items.map(({ to, key, Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 flex-1 transition-opacity ${
              active ? "opacity-100" : "opacity-40"
            }`}
          >
            <div
              className={`grid place-items-center w-9 h-9 rounded-xl transition-colors ${
                active ? "bg-forest text-white" : "text-forest"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.4} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">{k(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
