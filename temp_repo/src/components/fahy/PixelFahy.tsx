import happy from "@/assets/fahy-pixel-happy.png";
import excited from "@/assets/fahy-pixel-excited.png";
import sleepy from "@/assets/fahy-pixel-sleepy.png";
import curious from "@/assets/fahy-pixel-curious.png";
import sad from "@/assets/fahy-pixel-sad.png";
import proud from "@/assets/fahy-pixel-proud.png";
import caring from "@/assets/fahy-pixel-caring.png";
import listening from "@/assets/fahy-pixel-listening.png";

export type FahyMood =
  "happy" | "excited" | "sleepy" | "curious" | "sad" | "proud" | "caring" | "listening";

const SRC: Record<FahyMood, string> = {
  happy,
  excited,
  sleepy,
  curious,
  sad,
  proud,
  caring,
  listening,
};

export function PixelFahy({
  mood = "happy",
  size = 48,
  className = "",
  alt,
}: {
  mood?: FahyMood;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={SRC[mood]}
      alt={alt ?? `Fahy ${mood}`}
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      className={`object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
}

/** Decorative scattered Fahys for backgrounds. Non-interactive, low opacity. */
export function ScatteredFahys() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <PixelFahy
        mood="happy"
        size={56}
        className="absolute top-[18%] -left-3 opacity-70 -rotate-6 animate-fade-in"
      />
      <PixelFahy
        mood="excited"
        size={44}
        className="absolute top-[42%] right-2 opacity-80 rotate-3"
      />
      <PixelFahy
        mood="curious"
        size={40}
        className="absolute top-[60%] left-4 opacity-70 -rotate-3"
      />
      <PixelFahy
        mood="caring"
        size={48}
        className="absolute top-[74%] right-3 opacity-75 rotate-6"
      />
      <PixelFahy mood="sleepy" size={42} className="absolute top-[88%] left-6 opacity-60" />
      <PixelFahy
        mood="proud"
        size={46}
        className="absolute top-[30%] right-8 opacity-30 -rotate-12"
      />
    </div>
  );
}
