import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-forest text-white py-12 pb-32 md:pb-12 mt-auto border-t border-forest/10">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xl font-display font-bold text-fahy-yellow mb-4 block">
              Fahy Urban Pulse
            </span>
            <p className="text-sm text-sage/80 max-w-sm">
              Empowering communities to restore the environment through
              collective action and sustainable living.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sage text-sm uppercase tracking-widest">
              Resources
            </h4>
            <Link
              to="/tasks"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Tasks
            </Link>
            <Link
              to="/leaderboard"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              to="/settings"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Settings
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sage text-sm uppercase tracking-widest">
              Community
            </h4>
            <Link
              to="/culture"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Artisan Path
            </Link>
            <Link
              to="/ecosystem"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Ecosystem Map
            </Link>
            <Link
              to="/report"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Report Issues
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-white/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Fahy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
