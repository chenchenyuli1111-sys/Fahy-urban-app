import { useState } from "react";
import { type FahyEvolution, PixelFahy } from "./PixelFahy";
import { useLang } from "@/lib/i18n";
import { X } from "lucide-react";

export function FahyGuide({
  message,
  level = 1,
}: {
  message: string;
  level?: number;
}) {
  const { k } = useLang();
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="flex items-start gap-3 px-5 pt-4 relative animate-fade-in z-20">
      <div className="mt-1">
        <PixelFahy level={level} size={32} />
      </div>
      <div className="bg-white border border-fahy-yellow/50 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm text-xs leading-snug text-forest/80 flex-1 relative pr-6">
        <span className="font-bold text-forest">{k("fahy.label")}: </span>
        {message}
        <button
          onClick={() => setShow(false)}
          className="absolute top-1.5 right-1.5 text-forest/30 hover:text-forest transition-colors p-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
