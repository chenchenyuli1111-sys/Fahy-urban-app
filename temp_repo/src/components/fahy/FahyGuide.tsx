import { PixelFahy, type FahyMood } from "./PixelFahy";
import { useLang } from "@/lib/i18n";

export function FahyGuide({ message, mood = "happy" }: { message: string; mood?: FahyMood }) {
  const { k } = useLang();
  return (
    <div className="flex items-start gap-3 px-5 pt-4">
      <div className="w-12 h-12 rounded-2xl bg-peach-soft/60 p-1 shrink-0 grid place-items-center">
        <PixelFahy mood={mood} size={40} />
      </div>
      <div className="bg-white border border-black/5 rounded-2xl rounded-tl-md px-3 py-2 shadow-xs text-xs leading-snug text-forest/80 max-w-[260px]">
        <span className="font-bold text-forest">{k("fahy.label")}: </span>
        {message}
      </div>
    </div>
  );
}
