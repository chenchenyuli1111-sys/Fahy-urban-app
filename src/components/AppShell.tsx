import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ScatteredFahys, PreloadFahyAssets } from "@/components/fahy/PixelFahy";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FahyChat } from "./fahy/FahyChat";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface min-h-screen font-body text-forest flex flex-col relative z-0">
      <PreloadFahyAssets />
      <ScatteredFahys />
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-28 md:pb-12 relative overflow-x-hidden animate-fade-in md:px-5">
        <div className="md:max-w-2xl md:mx-auto lg:max-w-4xl xl:max-w-5xl bg-white md:min-h-[80vh] md:border-x md:border-black/5 md:shadow-sm">
          {children}
        </div>
      </main>

      <Footer />

      {/* Interactive Fahy Chatbot */}
      <FahyChat />

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
