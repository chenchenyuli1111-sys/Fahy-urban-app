import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Map,
  BookUser,
  Coins,
  AlertTriangle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useLang, type DictKey } from "@/lib/i18n";

const navItems = [
  { to: "/", key: "nav.hub" as DictKey, Icon: Home },
  { to: "/ecosystem", key: "nav.eco" as DictKey, Icon: Map },
  { to: "/culture", key: "nav.path" as DictKey, Icon: BookUser },
  { to: "/wallet", key: "nav.coin" as DictKey, Icon: Coins },
  { to: "/report", key: "nav.report" as DictKey, Icon: AlertTriangle },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { k } = useLang();

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-forest/5">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span className="text-xl font-display font-bold text-forest tracking-tight">
            Fahy<span className="text-fahy-yellow">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ to, key, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  active ? "text-forest" : "text-forest/50 hover:text-forest/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{k(key)}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/settings"
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-forest transition-colors active:scale-95"
        >
          <SettingsIcon className="w-4 h-4" strokeWidth={2.4} />
        </Link>
      </div>
    </header>
  );
}
